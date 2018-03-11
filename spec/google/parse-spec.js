/*global describe, it, expect, require */
'use strict';

var parse = require('../../lib/google/parse');

describe('Google parse', () => {
  it('should return the parsed request', () => {
    let req = {
      user: {
        userId: 'abcd'
      },
      "inputs": [{
        "intent": "actions.intent.MAIN",
        "rawInputs": [{
          "inputType": "VOICE",
          "query": "talk to daphne"
        }]
      }],
    };
    expect(parse(req)).toEqual({
      sender: 'abcd',
      text: 'talk to daphne',
      originalRequest: req,
      type: 'google'
    });
  });
  it('should return empty text if no inputs are provided', () => {
    let req = {
      user: {
        userId: 'abcd'
      },
      inputs: [{}]
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
      inputs: [{}]
    };
    expect(parse(req)).toBeUndefined();
  });
});