import {
  SESv2Client, 
  SendEmailCommand, 
  SendEmailCommandOutput
} from '@aws-sdk/client-sesv2';

import VP from '../types/vp';
import { InvitationLinks } from './jwt-service';

export default class EmailClient {
  private templateName = 'invite-template'

  constructor(private readonly sesClient: SESv2Client){}

  public async SendEmail(vp: VP, links: InvitationLinks) : Promise<SendEmailCommandOutput> {
    const commandPut = new SendEmailCommand({
      FromEmailAddress: 'ino@distortionaladdict.com',
      Destination: {
        ToAddresses: [vp.email],
      },
      Content: {
        Template: {
          TemplateName: this.templateName,
          TemplateData: JSON.stringify({
            name: vp.name,
            accepturl: links.acceptLink,
            rejecturl: links.rejectLink,
          }),
        }
      }
    });

    return this.sesClient.send(commandPut)
  }
}