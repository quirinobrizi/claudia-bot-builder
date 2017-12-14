'use strict'

module.exports = function(messageObject) {

  if (messageObject && messageObject.text !== undefined &&
    messageObject.id !== undefined && messageObject.sender !== 'bot'){
    return {
      sender: messageObject.id,
      text: messageObject.text,
      originalRequest: messageObject,
      type: 'custom'
    };
  }
};
