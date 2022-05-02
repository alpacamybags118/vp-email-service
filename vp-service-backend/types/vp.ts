import { AttributeValue} from "@aws-sdk/client-dynamodb"

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export default class VP {
  constructor(
    public name: string,
    public email: string,
    public emailSent?: boolean,
    public invitationStatus?: InvitationStatus,
    ){}

  public ToDynamoItemInput(): {[key: string]: AttributeValue} {
    return {
      "name": {
        S: this.name,
      },
      "email": {
        S: this.email,
      },
      "emailSent": {
        BOOL: this.emailSent || false,
      },
      "invitationStatus": {
        S: this.invitationStatus ? this.invitationStatus : InvitationStatus.PENDING
      }
    }
  }
}