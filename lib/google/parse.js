'use strict'

/**
 * Parses the request sent by google devices into the standard exa-bot-builder message.
 *{
 *   "user": {
 *       "userId": "wCBxFjVLK8I+nxIXfFOHEf/iAvvaTFuzUdBw6Gv5K3Q="
 *   },
 *   "conversation": {
 *       "conversationId": "1494709404186",
 *       "type": "NEW"
 *   },
 *  "inputs": [
 *       {
 *           "intent": "actions.intent.MAIN",
 *           "rawInputs": [
 *               {
 *                   "inputType": "KEYBOARD",
 *                   "query": "talk to my test app"
 *               }
 *           ],
 *           "arguments": [
 *               {
 *                   "name": "trigger_query",
 *                   "rawText": "conosci cantine vinicole nelle vicinanze",
 *                   "textValue": "conosci cantine vinicole nelle vicinanze"
 *               }
 *           ]
 *       }
 *   ],
 *   "surface": {
 *       "capabilities": [
 *           {
 *               "name": "actions.capability.AUDIO_OUTPUT"
 *           },
 *           {
 *               "name": "actions.capability.SCREEN_OUTPUT"
 *           }
 *       ]
 *   }
 *}
 * @see https://developers.google.com/actions/reference/rest/conversation-webhook 
 * @param {Any} messageObject
 */
module.exports = function googleParse(messageObject) {
  // TODO: verify incoming request
  if (!messageObject.user) {
    return undefined;
  }

  let getTextFromMainOrTextRequest = function (messageObject) {
    let res = messageObject.inputs.filter((input => (input.intent == 'actions.intent.MAIN' || input.intent == 'actions.intent.TEXT' || input.intent == 'actions.intent.VOICE')));
    if (res && res.length > 0) {
      let data = res[0];
      if (data.arguments) {
        let triggerQueries = data.arguments.filter(arg => arg.name == 'trigger_query');
        if (triggerQueries && triggerQueries.length > 0) {
          return triggerQueries[0].textValue;
        }
      } else if (data.rawInputs) {
        return data.rawInputs[0].query;
      }
    }
    return '';
  }

  return {
    sender: messageObject.user.userId,
    text: getTextFromMainOrTextRequest(messageObject),
    originalRequest: messageObject,
    attachments: messageObject.conversation ? messageObject.conversation.conversationToken : undefined,
    type: 'google'
  };
}