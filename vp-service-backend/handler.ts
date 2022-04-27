import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from 'aws-lambda';

import { Validator } from './helpers/validator';
import VPDataAccess from './helpers/vp-data-access';
import VP from './types/vp';

const vpDataAccess = new VPDataAccess() // Initializing outside of function scope to keep any connection pools in memory between executions

export async function AddVP(event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  let vp: VP;

  try {
    vp = Validator.ValidateRequest(event)
  } catch(err: unknown) {
    return {
      statusCode: 500,
      body: `${err}`
    }
  }
  console.log('writing data')
  return vpDataAccess.WriteVP(vp)
    .then(() => {
      return {
        statusCode: 200,
        body: 'good',
      }
    })
    .catch((err) => {
      return {
        statusCode: 500,
        body: `${err}`
      }
    })
  
}