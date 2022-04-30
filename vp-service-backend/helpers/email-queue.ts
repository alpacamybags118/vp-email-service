import {SQSClient, SendMessageCommand, SendMessageCommandOutput} from '@aws-sdk/client-sqs';
import VP from '../types/vp';

export default class EmailQueue {
  private sqsClient: SQSClient

  constructor(){
    this.sqsClient = new SQSClient({ // TODO pass in client instead for testing ease
      region: 'us-east-2',
      ...(process.env.IS_OFFLINE && {endpoint: 'http://localhost:9324'}),
    });
  }

  public async PutEmailInQueue(vp: VP): Promise<SendMessageCommandOutput> {
    const message = new SendMessageCommand({
      MessageBody: JSON.stringify(vp),
      QueueUrl: process.env.QUEUE_URL,
    });

    return this.sqsClient.send(message);
  }
}