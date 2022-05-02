import { Validator } from '../helpers/validator';
import VP from '../types/vp';

describe('validator', () => {
  it('should return a VP for valid input', () => {
    const request = JSON.stringify({
      name: 'tester',
      email: 'tester@test.com'
    });

    const result = Validator.ValidateRequest(request);

    expect(result).toEqual(new VP('tester', 'tester@test.com'));
  });

  it('Should throw an error if the request is empty', () => {
    const request = JSON.stringify(undefined);

    expect(() => { Validator.ValidateRequest(request)}).toThrowError('No request data provided.');
  })

  it('Should throw an error if data is missing', () => {
    const request = JSON.stringify({
      name: 'something'
    });

    expect(() => { Validator.ValidateRequest(request)}).toThrowError('Name or Email missing from request.');
  })

  it('Should throw an error if invalid JSON', () => {
    const request = '{dawdawdawda'

    expect(() => { Validator.ValidateRequest(request)}).toThrow();
  })

  it('Should throw an error if email is not in correct format', () => {
    const request = JSON.stringify({
      name: 'tester',
      email: 'notavalidemail'
    });

    expect(() => { Validator.ValidateRequest(request)}).toThrowError('Email provided is invalid.');
  })
})