import { DynamoDBClient,  
  PutItemCommand, 
  PutItemCommandInput, 
  PutItemCommandOutput, 
  ScanCommand, 
  ScanCommandOutput,
  GetItemCommand,
  UpdateItemCommandOutput,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';

import VP, { InvitationStatus } from '../types/vp';

export default class VPDataAccess{
  private dynamoClient: DynamoDBClient

  constructor() {
    this.dynamoClient = new DynamoDBClient({
      region: process.env.IS_OFFLINE ? 'localhost' : 'us-east-2',
      ...(process.env.IS_OFFLINE && { endpoint: 'http://localhost:8000' }),
    });
  }

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
        console.log(record);
        if(!record.Item) {
          return undefined;
        }

        return new VP(record.Item['name'].S, record.Item['email'].S, record.Item['emailSent'].BOOL, InvitationStatus[record.Item['invitationStatus'].S])
      })
      .catch((err) => {
        throw err;
      })
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
      .catch((err: unknown) => {
        console.log(err);
        throw err;
      })
  }

  public async WriteVP(vp: VP): Promise<PutItemCommandOutput> {
    const request = new PutItemCommand({
      TableName: process.env.DYNAMO_TABLE_NAME,//TODO: create a class to load env vars and inject.
      Item: vp.ToDynamoItemInput(),
    })

    console.log(request.input.Item);
    return this.dynamoClient.send(request)
      .catch((err: unknown) => {
        console.log(err);
        throw err
      });
  }

  public async UpdateVp(vp: VP): Promise<UpdateItemCommandOutput> {
    const request = new UpdateItemCommand({
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
      .catch((err: unknown) => {
        console.log(err);
        throw err
      });
  }
}