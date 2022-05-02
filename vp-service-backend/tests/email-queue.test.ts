import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { mockClient } from "aws-sdk-client-mock";
import EmailQueue from "../helpers/email-queue";
import VP from "../types/vp";

describe('email-queue', () => {
  const sqsClient = new SQSClient({});
  const mockSQS = mockClient(sqsClient);

  it('should queue a message when PutEmailInQueue is called', async () => {
    mockSQS
      .on(SendMessageCommand)
      .resolves({
        MessageId: '12345'
      });

      const vp = new VP('test', 'test@test.com')
      const emailQueue = new EmailQueue(sqsClient);
      const response = await emailQueue.PutEmailInQueue(vp);

      expect(response.MessageId).toEqual('12345');
  })

  it('should throw if SQS client throws', async () => {
    mockSQS
      .on(SendMessageCommand)
      .rejects('didnt work :(')

      const vp = new VP('test', 'test@test.com')
      const emailQueue = new EmailQueue(sqsClient);

      expect(async () => await emailQueue.PutEmailInQueue(vp)).rejects.toThrowError('didnt work :(')
  })
})