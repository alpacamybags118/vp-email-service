import { APIGatewayProxyEvent } from 'aws-lambda';
import * as EmailValidator from 'email-validator';

import VP from '../types/vp'

export class Validator {
  static ValidateRequest(request: string): VP {
    let vp: VP;

    if(!request) {
      throw new Error('No request data provided.');
    }

    try {
      const vpData = JSON.parse(request)
      vp = new VP(vpData.name, vpData.email);
    } catch(err: unknown) {
      throw err
    }

    if(!vp.name || !vp.email) {
      throw new Error('Name or Email missing from request.');
    }

    if(!EmailValidator.validate(vp.email)) {
      throw new Error('Email provided is invalid.')
    }

    return vp;
  }
}