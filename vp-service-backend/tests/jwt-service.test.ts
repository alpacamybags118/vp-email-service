import { DecryptCommand, EncryptCommand, KMSClient } from "@aws-sdk/client-kms";
import { mockClient } from "aws-sdk-client-mock";
import base64url from "base64url";
import JwtService from "../helpers/jwt-service";
import VP, { InvitationStatus } from "../types/vp";

describe('jwt-service', () => {
  const kmsClient = new KMSClient({});
  const mockKMS = mockClient(kmsClient);
  const staticEncodedToken = 'eyJhbGciOiJLTVMiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoidGVzdGVyIiwiZW1haWwiOiJ0ZXN0ZXJAdGVzdC5jb20iLCJlbWFpbFNlbnQiOnRydWUsImludml0YXRpb25TdGF0dXMiOiJQRU5ESU5HIiwiaW52aXRlU3RhdHVzIjoiYWNjZXB0IiwiZXhwIjoiMTk3MC0wMS0yMFQwMzo0NDoxOS4xMzFaIn0.AQI';


  let oneHourFuture;

  beforeAll(() => {
    process.env.KEY_ID = '12345';
    process.env.BASE_URL = 'www.test.com'
    jest.spyOn(Date, 'now').mockImplementation(() => 1651459131);
    oneHourFuture = new Date(Date.now()).getTime() + (60 * 60 * 1000);
  })

  afterAll(() => {
    jest.spyOn(Date, 'now').mockRestore();
  });

  it('should give encoded urls for accept and reject', async () => {
    mockKMS
      .on(EncryptCommand)
      .resolves({
        CiphertextBlob: new Uint8Array([1,2])
      });

      const vp = new VP('tester', 'tester@test.com', true, InvitationStatus.PENDING);
      const jwtService = new JwtService(kmsClient);

      const result = await jwtService.CreateInviteLinks(vp);

      const acceptToken = result.acceptLink.split('=')[1].split('.');
      const rejectToken = result.rejectLink.split('=')[1].split('.');

      const acceptUrl = JSON.parse(base64url.decode(acceptToken[1]));
      const rejectUrl = JSON.parse(base64url.decode(rejectToken[1]));

      expect(acceptUrl.email).toEqual(vp.email);
      expect(acceptUrl.exp).toEqual(new Date(oneHourFuture).toISOString());
      expect(acceptUrl.inviteStatus).toEqual('accept');

      expect(rejectUrl.email).toEqual(vp.email);
      expect(rejectUrl.exp).toEqual(new Date(oneHourFuture).toISOString());
      expect(rejectUrl.inviteStatus).toEqual('reject');
  });

  it('should throw if KMS client throws', async () => {
    mockKMS
      .on(EncryptCommand)
      .rejects('didnt work :(')
    

    const vp = new VP('tester', 'tester@test.com', true, InvitationStatus.PENDING);
    const jwtService = new JwtService(kmsClient);

    expect(async () => await jwtService.CreateInviteLinks(vp)).rejects.toThrowError('didnt work :(');
  });

  it('should decode a token as expected', async () => {
    mockKMS
      .on(DecryptCommand)
      .callsFake(async () => {
        const splitToken = staticEncodedToken.split('.')
        return {
          Plaintext: Buffer.from(base64url(`${splitToken[0]}.${splitToken[1]}`), 'base64'),
        };
      });
    

    const jwtService = new JwtService(kmsClient);
    const result = await jwtService.DecodeSignedLink(staticEncodedToken);

    expect(result.email).toEqual('tester@test.com');
  });

  it('should throw an exception if token is expired', async () => {
    mockKMS
      .on(DecryptCommand)
      .callsFake(async () => {
        const splitToken = staticEncodedToken.split('.')
        return {
          Plaintext: Buffer.from(base64url(`${splitToken[0]}.${splitToken[1]}`), 'base64'),
        };
      });
    
    const vp = new VP('test', 'test@test.com', true, InvitationStatus.PENDING);
    
    const payload = {
      ...vp,
      inviteStatus: 'accept',
      exp: new Date(new Date(Date.now()).getTime() - (60 * 60 * 1000)),
    }

    console.log(`test exp:${payload.exp.toISOString()}`);
    const encodedPayload = base64url(JSON.stringify(payload));
    const jwtService = new JwtService(kmsClient);
    const expiredToken = staticEncodedToken.split('.');
    expiredToken[1] = encodedPayload;
    const expired = expiredToken.join('.');

    await expect(jwtService.DecodeSignedLink(expired)).rejects.toThrowError('Token has expired!');
  });

  it('should throw an exception if token is garbage', async () => {
    const jwtService = new JwtService(kmsClient);

    await expect(jwtService.DecodeSignedLink('foahfiawhiagefbua')).rejects.toThrowError('Invalid token');
  });

  it('should throw an exception if signature is tampered', async () => {
    mockKMS
      .on(DecryptCommand)
      .callsFake(async () => {
        const splitToken = staticEncodedToken.split('.')
        return {
          Plaintext: Buffer.from(base64url(`${splitToken[0]}`), 'base64'),
        };
      });
    

    const jwtService = new JwtService(kmsClient);

    await expect(jwtService.DecodeSignedLink(staticEncodedToken)).rejects.toThrowError('Signature is invalid!')
  });

})