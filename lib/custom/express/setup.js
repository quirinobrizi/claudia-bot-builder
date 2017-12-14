'use strict'

const parse = require('../parse');
const reply = require('../reply');

module.exports = function customSetup(api, bot, logError, optionalParser, optionalResponder) {

  let parser = optionalParser || parse;
  let responder = optionalResponder || reply;

  api.post('/custom', (req, res) => {
      let arr = [].concat.apply([], req.body.messages);
      let handle = parsedMessage => {
        if (parsedMessage){
          return Promise.resolve(parsedMessage).then(parsedMessage => bot(parsedMessage, req))
            .then(botResponse => responder(parsedMessage, res, null))
            .catch(logError);
        }
      };

      return Promise.all(arr.map(message => handle(parser(message))))
        .then(() => 'ok');
  });

  api.addPostDeployStep('custom', (options, lambdaDetails, utils) => {
      console.log("execute post deployment step for custom handler");
  });
}
