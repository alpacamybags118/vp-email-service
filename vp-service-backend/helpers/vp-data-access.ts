import { DynamoDBClient,  PutItemCommand, PutItemCommandInput, PutItemCommandOutput} from '@aws-sdk/client-dynamodb'
import VP from '../types/vp';

export default class VPDataAccess{
  private dynamoClient: DynamoDBClient

  constructor() {
    this.dynamoClient = new DynamoDBClient({
      region: 'localhost', // TODO: read this from an env var
      endpoint: 'http://localhost:5000',
    });
  }

  public async WriteVP(vp: VP): Promise<PutItemCommandOutput> {
    console.log(process.env.DYNAMO_TABLE_NAME)
    const request = new PutItemCommand({
      TableName: process.env.DYNAMO_TABLE_NAME,//TODO: create a class to load env vars and inject.
      Item: vp.ToDynamoItemInput(),
    } as PutItemCommandInput)
    console.log('stuff')
    return this.dynamoClient.send(request)
      .catch((err: unknown) => {
        throw err
      });
  }
}