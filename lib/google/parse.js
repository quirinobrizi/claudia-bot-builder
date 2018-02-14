'use strict'

/**
 * Parses the request sent by DialogFlow into the standard exa-bot-builder message.
 * {
 *  "session": string,
 *  "responseId": string,
 *  "queryResult": {
 *    object(QueryResult)
 *  },
 *  "originalDetectIntentRequest": {
 *    object(OriginalDetectIntentRequest)
 *  },
 * }
 * @see https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/WebhookRequest
 * @param {Any} messageObject
 */
module.exports = function googleParse(messageObject) {
  console.log(require('util').inspect(messageObject, { depth: null }));

  return {
    sender: messageObject.session,
    text: messageObject.queryResult.queryText,
    action: messageObject.queryResult.action,
    originalRequest: messageObject,
    type: 'google-dialog-flow'
  };
}