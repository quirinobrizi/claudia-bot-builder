'use strict'

const googleParse = require('./parse');
const googleReply = require('./reply');

module.exports = function googleSetup(api, bot, logError, optionalParser, optionalResponder) {
  let parser = optionalParser || googleParse;
  let responder = optionalResponder || googleReply;

  api.post('/google', request => {
    return bot(parser(request.body), request)
      .then(botReply => responder(botReply, request.body))
      .catch(logError);
  });

  api.addPostDeployStep('google', (options, details, utils) => {
    return Promise.resolve({
      botUrl: `${details.apiUrl}/google`
    });
  });

}