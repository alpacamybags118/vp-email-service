import {SQSClient, SendMessageCommand, SendMessageCommandOutput} from '@aws-sdk/client-sqs';
import VP from '../types/vp';

export default class EmailQueue {

  constructor(private readonly sqsClient: SQSClient){}

  public async PutEmailInQueue(vp: VP): Promise<SendMessageCommandOutput> {
    const message = new SendMessageCommand({
      MessageBody: JSON.stringify(vp),
      QueueUrl: process.env.QUEUE_URL,
    });

    return this.sqsClient.send(message);
  }
}