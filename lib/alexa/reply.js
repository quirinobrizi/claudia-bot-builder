'use strict';

module.exports = function alexaReply(botResponse, botName, response) {
    let answer;
    if (typeof botResponse === 'string' && botName) {
        answer = {
            response: {
                outputSpeech: {
                    type: 'PlainText',
                    text: botResponse
                },
                card: {
                    type: 'Simple',
                    title: botName || '',
                    content: botResponse
                },
                shouldEndSession: true
            }
        };
    } else {
        answer = botResponse;
    }
    return answer;
};
