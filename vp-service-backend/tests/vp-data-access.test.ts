import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import {mockClient} from 'aws-sdk-client-mock';
import VPDataAccess from '../helpers/vp-data-access';
import VP, { InvitationStatus } from '../types/vp';

describe('vp-data-access', () => {
  const dynamoClient = new DynamoDBClient({});
  const mockDynamo = mockClient(dynamoClient);

  it('should get the VP from the given email', async () => {
    mockDynamo
      .on(GetItemCommand)
      .resolves({
        Item: {
          name: {
            'S': 'tester'
          },
          email: {
            'S': 'tester@test.com'
          },
          emailSent: {
            'BOOL': false
          },
          invitationStatus: {
            'S': InvitationStatus.PENDING
          }
        }
      });

      const request: VP = new VP('tester', 'tester@test.com');
      const dbAccess = new VPDataAccess(dynamoClient)
      const result = await dbAccess.GetVpByEmail(request);

      expect(result.name).toEqual('tester');
  })

  it('should return undefined if vp doesnt exist by email', async () => {
    mockDynamo
      .on(GetItemCommand)
      .resolves({});

      const request: VP = new VP('tester', 'tester@test.com');
      const dbAccess = new VPDataAccess(dynamoClient)
      const result = await dbAccess.GetVpByEmail(request);

      expect(result).toEqual(undefined);
  })

  it('should throw error if dynamo client rejects', async () => {
    mockDynamo
      .on(GetItemCommand)
      .rejects('didnt work :(')

      const request: VP = new VP('tester', 'tester@test.com');
      const dbAccess = new VPDataAccess(dynamoClient);

      expect(async() => await dbAccess.GetVpByEmail(request)).rejects.toThrowError('didnt work :(')
  })

  it('should gets all VPs when GetVps is called', async () => {
    mockDynamo
      .on(ScanCommand)
      .resolves({
        Items: [
          {
            name: {
              'S': 'tester'
            },
            email: {
              'S': 'tester@test.com'
            },
            emailSent: {
              'BOOL': false
            },
            invitationStatus: {
              'S': InvitationStatus.PENDING
            }
          },
          {
            name: {
              'S': 'tester2'
            },
            email: {
              'S': 'tester2@test.com'
            },
            emailSent: {
              'BOOL': true
            },
            invitationStatus: {
              'S': InvitationStatus.ACCEPTED
            }
          }
        ]
      });

      const dbAccess = new VPDataAccess(dynamoClient);
      const result = await dbAccess.GetVps();

      expect(result.length).toEqual(2);
      expect(result[0].email).toEqual('tester@test.com')
      expect(result[1].email).toEqual('tester2@test.com')
  });

  it('should reject if dynamo client rejects', async () => {
    mockDynamo
      .on(ScanCommand)
      .rejects('didnt work :(')

      const dbAccess = new VPDataAccess(dynamoClient);

      expect(async() => await dbAccess.GetVps()).rejects.toThrowError('didnt work :(')
  })

  it('resolve when writing VP', async () => {
    mockDynamo
      .on(PutItemCommand)
      .resolves({})

      const dbAccess = new VPDataAccess(dynamoClient);
      const vp = new VP('test', 'test@test.com', true, InvitationStatus.ACCEPTED);

      expect(async() => await dbAccess.WriteVP(vp)).resolves;
  })

  it('rejects when client fails', async () => {
    mockDynamo
      .on(PutItemCommand)
      .rejects('didnt work :(')

      const dbAccess = new VPDataAccess(dynamoClient);
      const vp = new VP('test', 'test@test.com', true, InvitationStatus.ACCEPTED);

      expect(async() => await dbAccess.WriteVP(vp)).rejects.toThrowError('didnt work :(')
  });

  it('Updates VP when UpdateVP is called', async () => {
    const mockVP = new VP('test', 'test@test.com', false, InvitationStatus.PENDING);

    mockDynamo
      .on(UpdateItemCommand)
      .callsFake((input) => {
        mockVP.emailSent = input.AttributeUpdates.emailSent.Value.BOOL
        mockVP.invitationStatus = input.AttributeUpdates.invitationStatus.Value.S
        return;
      })

      const dbAccess = new VPDataAccess(dynamoClient);
      const vp = new VP('test', 'test@test.com', true, InvitationStatus.ACCEPTED);
      await dbAccess.UpdateVp(vp);

      expect(mockVP.emailSent).toEqual(true);
      expect(mockVP.invitationStatus).toEqual(InvitationStatus.ACCEPTED);

  });

  it('VP is not updated if email dont match input', async () => {
    const mockVP = new VP('test', 'test@test.com', false, InvitationStatus.PENDING);

    mockDynamo
      .on(UpdateItemCommand)
      .callsFake((input) => {
        const email = input.Key.email.S
        
        if(mockVP.email != email) {
          return;
        }
        
        mockVP.emailSent = input.AttributeUpdates.emailSent.Value.BOOL
        mockVP.invitationStatus = input.AttributeUpdates.invitationStatus.Value.S

        return;
      })

      const dbAccess = new VPDataAccess(dynamoClient);
      const vp = new VP('test', 'test2@test.com', true, InvitationStatus.ACCEPTED);
      await dbAccess.UpdateVp(vp);

      expect(mockVP.emailSent).toEqual(false);
      expect(mockVP.invitationStatus).toEqual(InvitationStatus.PENDING);

  })
})