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
          }],
          suggestions: [],
          linkOutSuggestion: {}
        }
      },
      customPushMessage: {},
      isInSandbox: false
    });
  });

  it('should set response with expectedInputs', () => {
    let testObj = new Formatter();
    testObj.expectUserResponse();

    expect(testObj.present([testObj.simpleResponseBuilder().setTextToSpeech('text').done()]).get()).toEqual({
      conversationToken: {},
      userStorage: '',
      resetUserStorage: false,
      expectUserResponse: true,
      expectedInputs: [{
        inputPrompt: {
          richInitialPrompt: {
            items: [{
              simpleResponse: {
                textToSpeech: 'text',
                ssml: undefined,
                displayText: undefined
              }
            }],
            suggestions: [],
            linkOutSuggestion: {}
          },
          noInputPrompts: []
        },
        possibleIntents: [{
          intent: 'actions.intent.TEXT'
        }]
      }],
      customPushMessage: {},
      isInSandbox: false
    });
  });

  it('should set response with expectedInputs with suggestions', () => {
    let testObj = new Formatter();
    testObj.expectUserResponse();

    expect(testObj
      .present([testObj.simpleResponseBuilder().setTextToSpeech('text').done()])
      .suggestions(['More'])
      .get()).toEqual({
      conversationToken: {},
      userStorage: '',
      resetUserStorage: false,
      expectUserResponse: true,
      expectedInputs: [{
        inputPrompt: {
          richInitialPrompt: {
            items: [{
              simpleResponse: {
                textToSpeech: 'text',
                ssml: undefined,
                displayText: undefined
              }
            }],
            suggestions: [{
              title: 'More'
            }],
            linkOutSuggestion: {}
          },
          noInputPrompts: []
        },
        possibleIntents: [{
          intent: 'actions.intent.TEXT'
        }]
      }],
      customPushMessage: {},
      isInSandbox: false
    });
  });

  it('should set response with expectedInputs with suggestions and link out suggetion', () => {
    let testObj = new Formatter();
    testObj.expectUserResponse();

    expect(testObj
      .present([testObj.simpleResponseBuilder().setTextToSpeech('text').done()])
      .suggestions(['More'])
      .linkOutSuggestion('Test', 'http://test.com')
      .get()).toEqual({
      conversationToken: {},
      userStorage: '',
      resetUserStorage: false,
      expectUserResponse: true,
      expectedInputs: [{
        inputPrompt: {
          richInitialPrompt: {
            items: [{
              simpleResponse: {
                textToSpeech: 'text',
                ssml: undefined,
                displayText: undefined
              }
            }],
            suggestions: [{
              title: 'More'
            }],
            linkOutSuggestion: {
              destinationName: 'Test',
              openUrlAction: {
                url: 'http://test.com'
              }
            }
          },
          noInputPrompts: []
        },
        possibleIntents: [{
          intent: 'actions.intent.TEXT'
        }]
      }],
      customPushMessage: {},
      isInSandbox: false
    });
  });

});