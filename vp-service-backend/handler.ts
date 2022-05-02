import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { KMSClient } from '@aws-sdk/client-kms';
import { ContactListImportAction, SESv2Client } from '@aws-sdk/client-sesv2';
import { SQSClient } from '@aws-sdk/client-sqs';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  SQSEvent,
  SQSBatchResponse
} from 'aws-lambda';
import EmailClient from './helpers/email-client';
import EmailQueue from './helpers/email-queue';
import JwtService, { InvitationLinks } from './helpers/jwt-service';

import { Validator } from './helpers/validator';
import VPDataAccess from './helpers/vp-data-access';
import VP from './types/vp';

/*
  Initializing AWS clients outside of handler scope so they can persist between lambda executions
*/
const vpDataAccess = new VPDataAccess(
  new DynamoDBClient({
    region: process.env.IS_OFFLINE ? 'localhost' : 'us-east-2',
    ...(process.env.IS_OFFLINE && { endpoint: 'http://localhost:8000' }),
  }))

const emailQueue: EmailQueue = new EmailQueue(
  new SQSClient({
    region: 'us-east-2',
    ...(process.env.IS_OFFLINE && {endpoint: 'http://localhost:9324'}),
}));

const emailClient: EmailClient = new EmailClient(
  new SESv2Client({
    region: 'us-east-2'
}));

const kmsClient = new KMSClient({
  region: 'us-east-2'
});

export async function AddVP(event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let vp: VP;

  try {
    vp = Validator.ValidateRequest(event.body || "")
  } catch(err: unknown) {
    return {
      statusCode: 500,
      body: `${err}`
    }
  }

  try {
    await vpDataAccess.GetVpByEmail(vp)
      .then((data) => {
        if(data) {
          throw new Error('VP with provided email already on record!')
        }

        return vpDataAccess.WriteVP(vp)
      })
  } catch (err: unknown) {
      return {
        statusCode: 500,
        body: `${err}`,
        headers: {
          'Content-Type': 'text/plain',
          "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Methods": 'POST,OPTIONS'
        }
      }
  }

  await emailQueue.PutEmailInQueue(vp)
    .catch((err) => {
      console.error(`Unable to send email to VP: ${err}`); // want to log we couldnt send an email but shouldnt fail the function
    });

  return {
    statusCode: 200,
    body: 'VP successfully added',
    headers: {
      'Content-Type': 'text/plain',
      "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": 'POST,OPTIONS'
    }
  }
}

export async function SendEmail(event: SQSEvent): Promise<SQSBatchResponse | undefined> {
  let vp: VP;

  try {
    vp = Validator.ValidateRequest(event.Records[0].body)
  } catch(err: unknown) {
    console.log(err);
    return {
      batchItemFailures:[{
        itemIdentifier: event.Records[0].messageId
      }]
    }
  }

  const jwtService = new JwtService(kmsClient);

  vp.emailSent = true;
  await jwtService.CreateInviteLinks(vp)
    .then((links: InvitationLinks) => {
      return emailClient.SendEmail(vp, links)
    })
  .then((resp) => {
    if(resp.$metadata.httpStatusCode != 200) {
      console.log(resp.$metadata);
    }

    return vpDataAccess.UpdateVp(vp);
  })
  .catch((err: unknown) => {
    console.log(err);

    return {
      batchItemFailures:[{
        itemIdentifier: event.Records[0].messageId
      }]
    }
  });
}

export async function GetVps(): Promise<APIGatewayProxyResult> {
  let vps: VP[];

  try {
    vps = await vpDataAccess.GetVps();
  } catch(err: unknown) {
    return {
      statusCode: 500,
      body: `${err}`
    }
  }

    return {
      statusCode: 200,
      body: JSON.stringify(vps),
    };
}

export async function HandleInviteEvent(event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const token = event.queryStringParameters['token'];
  const jwtService = new JwtService(kmsClient);

  try {
    await jwtService.DecodeSignedLink(token)
      .then((updatedVp: VP) => {
        console.log(updatedVp);
        console.log(`VP ${updatedVp.name} has updated invite status to ${updatedVp.invitationStatus}`);
        return vpDataAccess.UpdateVp(updatedVp)
      })
      .then((resp) => {
        if(resp.$metadata.httpStatusCode != 200) {
          throw new Error('Failure writing to table');
        }
      })
  } catch(err: unknown) {
    console.log(err);
    return {
      statusCode: 500,
      body: `${err}`,
      headers: {
        'Content-Type': 'text/plain',
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Methods": 'POST,OPTIONS'
      }
    }
  }

  return {
    statusCode: 200,
    body: 'Invite event successfully handled',
    headers: {
      'Content-Type': 'text/plain',
      "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": 'POST,OPTIONS'
    }
  }
}