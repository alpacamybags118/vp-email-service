import { KMSClient, EncryptCommand, DecryptCommand} from '@aws-sdk/client-kms';
import VP, { InvitationStatus } from '../types/vp';
import base64url from 'base64url'

const oneHourMs = 60 * 60 * 1000;


export interface JwtToken {
  headers: any
  payload: any
  signature: string
}

export interface UnpackedJwtToken {
  headers: any
  payload: any
  encrypted: any
}

export interface InvitationLinks {
  acceptLink: string,
  rejectLink: string,
}

export default class JwtService {
  private signingkey: string = process.env.KEY_ID

  constructor(private readonly client: KMSClient) {}

  public async CreateInviteLinks(vp: VP): Promise<InvitationLinks> {
    const links = await Promise.all(['accept', 'reject'].map((status) => {
      const headers = {
        alg: 'KMS',
        typ: 'JWT',
      };

      const payload = {
        ...vp,
        inviteStatus: status,
        exp: new Date(new Date(Date.now()).getTime() + oneHourMs),
      }

      const parts = {
        header: base64url(JSON.stringify(headers)),
        payload: base64url(JSON.stringify(payload)),
      }

      const plaintext = Buffer.from(base64url(`${parts.header}.${parts.payload}`), 'base64');

      const input = new EncryptCommand({
        Plaintext: plaintext,
        KeyId: this.signingkey
      });

      return this.client.send(input)
        .then((data) => {
          return data.CiphertextBlob
        })
        .then((link) => {
            const signature = base64url(Buffer.from(link));
    
            return `${parts.header}.${parts.payload}.${signature}`;
          })
        .catch((err) => {
          throw err;
        });
    }));

    return {
      acceptLink: `${process.env.BASE_URL}?token=${links[0]}`,
      rejectLink: `${process.env.BASE_URL}?token=${links[1]}`,
    };
  }

  public async DecodeSignedLink(signedData: string): Promise<VP> {
    let unpackedToken: UnpackedJwtToken;

    try {
      unpackedToken = this.UnpackToken(signedData);
    } catch(err) {
      throw new Error('Invalid token');
    }
    console.log(unpackedToken);
    if(this.IsExpired(new Date(unpackedToken.payload.exp))) {
      throw new Error('Token has expired!');
    }

    const decryptArgs = new DecryptCommand({
      CiphertextBlob: Buffer.from(unpackedToken.encrypted.signature, 'base64'),
      KeyId: this.signingkey
    });

    return this.client.send(decryptArgs)
      .then((decryptedSignature) => {
        const decodedSig = base64url.decode(Buffer.from(decryptedSignature.Plaintext).toString('base64'));

        if(decodedSig !== `${unpackedToken.encrypted.headers}.${unpackedToken.encrypted.payload}`) {
          throw new Error('Signature is invalid!');
        }

        return new VP(unpackedToken.payload.name, unpackedToken.payload.email, 
          unpackedToken.payload.emailSent,
          unpackedToken.payload.inviteStatus === 'accept' ? InvitationStatus.ACCEPTED : InvitationStatus.REJECTED);
        })
        .catch((err) => {
          console.log(err);
          throw new Error('Token could not be decoded');
        })
  }

  private UnpackToken(token: string): UnpackedJwtToken {
    const unpacked = token.split('.')

    return {
      headers: JSON.parse(base64url.decode(unpacked[0])),
      payload: JSON.parse(base64url.decode(unpacked[1])),
      encrypted: {
        headers: unpacked[0],
        payload: unpacked[1],
        signature: unpacked[2],
      }
    }
  }

  private IsExpired(expDate: Date): boolean {
    return expDate.getTime() < new Date(Date.now()).getTime()
  }
}