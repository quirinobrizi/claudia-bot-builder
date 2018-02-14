'use strict'

const googleParse = require('./parse');
const googleReply = require('./reply');

module.exports = function googleSetup(api, bot, logError, optionalParser, optionalResponder) {
  let parser = optionalParser || googleParse;
  let responder = optionalResponder || googleReply;

  api.post('/action', request => {
    return bot(parser(request.body), request)
      .then(botReply => responder(botReply))
      .catch(logError);
  });

  api.addPostDeployStep('google-dialog-flow', (options, lambdaDetails, utils) => {
    return Promise.resolve(() => {
      return {
        botUrl: `${lambdaDetails.apiUrl}/action`
      }
    });
  });

}