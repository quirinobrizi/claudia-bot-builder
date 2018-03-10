'use strict'

/**
 * Compute the request to send to google dialog flow.
 * 
 * @see https://developers.google.com/actions/reference/rest/conversation-webhook
 * @see https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse
 * 
 * @param {Any} botResponse 
 * @param {Any} originalRequest 
 */
module.exports = function alexaReply(botResponse, originalRequest) {
  botResponse.conversationToken = originalRequest.conversation.conversationToken;
  return botResponse;
}