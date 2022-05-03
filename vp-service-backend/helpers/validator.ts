import { APIGatewayProxyEvent } from 'aws-lambda';
import * as EmailValidator from 'email-validator';

import VP, { InvitationStatus } from '../types/vp'

export class Validator {
  static ValidateRequest(request: string): VP {
    if(!request) {
      throw new Error('No request data provided.');
    }

    const vpData = JSON.parse(request)
    const vp = new VP(vpData.name, vpData.email, vpData.emailSent || false, vpData.InvitationStatus || InvitationStatus.PENDING);

    if(!vp.name || !vp.email) {
      throw new Error('Name or Email missing from request.');
    }

    if(!EmailValidator.validate(vp.email)) {
      throw new Error('Email provided is invalid.')
    }

    return vp;
  }
}