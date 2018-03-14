/*global describe, it, expect, require */
'use strict';

var Formatter = require('../../lib/google/format-message');

describe('Google message format', () => {
  it('should set expect response to true', () => {
    let testObj = new Formatter();

    expect(testObj.expectUserResponse().get()).toEqual({
      conversationToken: {},
      userStorage: '',
      resetUserStorage: false,
      expectUserResponse: true,
      expectedInputs: [],
      finalResponse: {},
      customPushMessage: {},
      isInSandbox: false
    });
  });

  it('should set response with final response', () => {
    let testObj = new Formatter();

    expect(testObj.ask([{
      speech: 'text'
    }]).get()).toEqual({
      conversationToken: {},
      userStorage: '',
      resetUserStorage: false,
      expectUserResponse: false,
      finalResponse: {
        richResponse: {
          items: [{
            simpleResponse: {
              textToSpeech: 'text',
              ssml: undefined,
              displayText: undefined
            }
          }]
        }
      },
      customPushMessage: {},
      isInSandbox: false
    });
  });

});