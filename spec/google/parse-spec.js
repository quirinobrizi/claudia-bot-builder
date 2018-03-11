/*global describe, it, expect, require */
'use strict';

var parse = require('../../lib/google/parse');

describe('Google parse', () => {
  it('should return the parsed request', () => {
    let req = {
      user: {
        userId: 'abcd'
      },
      inputs: {
        rawInputs: {
          query: 'The query from the user'
        }
      }
    };
    expect(parse(req)).toEqual({
      sender: 'abcd',
      text: 'The query from the user',
      originalRequest: req,
      type: 'google'
    });
  });
  it('should return empty text if no inputs are provided', () => {
    let req = {
      user: {
        userId: 'abcd'
      },
      inputs: {}
    };
    expect(parse(req)).toEqual({
      sender: 'abcd',
      text: '',
      originalRequest: req,
      type: 'google'
    });
  });

  it('should return undefined if inputs and user are not provided', () => {
    let req = {
      inputs: {}
    };
    expect(parse(req)).toBeUndefined();
  });
});