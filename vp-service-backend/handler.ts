import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
  SQSEvent,
  SQSBatchResponse
} from 'aws-lambda';
import EmailClient from './helpers/email-client';
import EmailQueue from './helpers/email-queue';

import { Validator } from './helpers/validator';
import VPDataAccess from './helpers/vp-data-access';
import VP from './types/vp';

const vpDataAccess = new VPDataAccess() // Initializing outside of function scope to keep any connection pools in memory between executions

export async function AddVP(event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  let vp: VP;

  try {
    vp = Validator.ValidateRequest(event.body || "")
  } catch(err: unknown) {
    return {
      statusCode: 500,
      body: `${err}`
    }
  }
  console.log('writing data')

  try {
    await vpDataAccess.WriteVP(vp)
    .catch((err) => {
      throw new Error(`Could not save VP info: ${err}`)
    });
  } catch (err: unknown) {
      return {
        statusCode: 500,
        body: `${err}`
      }
  }


  console.log('putting email in queue');
  
  const emailQueue = new EmailQueue();

  await emailQueue.PutEmailInQueue(vp)
    .catch((err) => {
      console.error(`Unable to send email to VP: ${err}`); // want to log we couldnt send an email but shouldnt fail the function
    });

  return {
    statusCode: 200,
    body: 'VP successfully added',
  }
}

export async function SendEmail(event: SQSEvent): Promise<SQSBatchResponse | undefined> {
  let vp: VP;
  console.log('in the email function')
  try {
    vp = Validator.ValidateRequest(event.Records[0].body)
  } catch(err: unknown) {
    console.error(err);
    return {
      batchItemFailures:[{
        itemIdentifier: event.Records[0].messageId
      }]
    }
  }

  const sesClient = new EmailClient();

  await sesClient.SendEmail(vp)
  .then(() => {
    vp.emailSent = true;
    console.log('writing update')
    vpDataAccess.WriteVP(vp);
  })
  .catch((err) => {
    console.error(err);

    return {
      batchItemFailures:[{
        itemIdentifier: event.Records[0].messageId
      }]
    }
  });
}

export async function GetVps(event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const vps = await vpDataAccess.GetVps()
    .catch((err: unknown) => {
      return {
        statusCode: 500,
        body: `${err}`
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(vps),
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'test': 'yea'
      }
    };
}