import { APIGatewayProxyEvent } from 'aws-lambda';
import * as EmailValidator from 'email-validator';

import VP from '../types/vp'

export class Validator {
  static ValidateRequest(request: APIGatewayProxyEvent): VP {
    let vp: VP;

    if(!request.body) {
      throw new Error('No request data provided.');
    }

    try {
      const vpData = JSON.parse(request.body)
      vp = new VP(vpData.name, vpData.email) as VP;
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