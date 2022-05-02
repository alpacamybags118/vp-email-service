import { DynamoDBClient,  
  PutItemCommand, 
  PutItemCommandOutput, 
  ScanCommand, 
  ScanCommandOutput,
  GetItemCommand,
  UpdateItemCommandOutput,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';

import VP, { InvitationStatus } from '../types/vp';

export default class VPDataAccess{
  constructor(private readonly dynamoClient: DynamoDBClient) {}

  public async GetVpByEmail(vp: VP): Promise<VP | undefined> {
    const request = new GetItemCommand({
      TableName: process.env.DYNAMO_TABLE_NAME,
      Key: {
        'email': {
          'S': vp.email,
        },
        'name': {
          'S': vp.name,
        },
      },
    });
    
    return this.dynamoClient.send(request)
      .then((record) => {
        if(!record.Item) {
          return undefined;
        }

        return new VP(record.Item['name'].S, record.Item['email'].S, record.Item['emailSent'].BOOL, InvitationStatus[record.Item['invitationStatus'].S])
      });
  }

  public async GetVps(): Promise<VP[]> {
    const request = new ScanCommand({
      TableName: process.env.DYNAMO_TABLE_NAME,
    });

    return this.dynamoClient.send(request)
      .then((response: ScanCommandOutput) => {
        return response.Items.map((record) => {
          return new VP(record['name'].S, record['email'].S, record['emailSent'].BOOL, InvitationStatus[record['invitationStatus'].S]);
        })
      })
  }

  public async WriteVP(vp: VP): Promise<PutItemCommandOutput> {
    const request = new PutItemCommand({
      TableName: process.env.DYNAMO_TABLE_NAME,//TODO: create a class to load env vars and inject.
      Item: vp.ToDynamoItemInput(),
    })

    return this.dynamoClient.send(request)
  }

  public async UpdateVp(vp: VP): Promise<UpdateItemCommandOutput> {
    const request = new UpdateItemCommand({
      TableName: process.env.DYNAMO_TABLE_NAME,
      Key: {
        'email': {
          'S': vp.email,
        },
        "name": {
          'S': vp.name,
        },
      },
      AttributeUpdates: {
        emailSent: {
          Action: 'PUT',
          Value: {
            'BOOL': vp.emailSent
          }
        },
        invitationStatus: {
          Action: 'PUT',
          Value: {
            'S': vp.invitationStatus ? vp.invitationStatus : InvitationStatus.PENDING
          }
        }
      }
    });

    return this.dynamoClient.send(request);
  }
}