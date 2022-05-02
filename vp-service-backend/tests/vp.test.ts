import VP, { InvitationStatus } from "../types/vp"

describe('VP', () => {
  it('should return valid dynamo object on ToDynamoItemInput', () => {
    const vp = new VP('gamer', 'gamer@gamer.com', true, InvitationStatus.ACCEPTED);
    const expected = {
        "name": {
          S: vp.name,
        },
        "email": {
          S: vp.email,
        },
        "emailSent": {
          BOOL: vp.emailSent
        },
        "invitationStatus": {
          S: vp.invitationStatus
        }
    }

    expect(vp.ToDynamoItemInput()).toEqual(expected);
  })

  it('should fill in default values if emailSent and invitationStatus not provided', () => {
    const vp = new VP('gamer', 'gamer@gamer.com');
    const expected = {
        "name": {
          S: vp.name,
        },
        "email": {
          S: vp.email,
        },
        "emailSent": {
          BOOL: false
        },
        "invitationStatus": {
          S: InvitationStatus.PENDING
        }
    }

    expect(vp.ToDynamoItemInput()).toEqual(expected);
  })
})