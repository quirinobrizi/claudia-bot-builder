'use strict';

const crypto = require('crypto');
const prompt = require('souffleur');
const rp = require('minimal-request-promise');
const fbReply = require('../reply');
const fbParse = require('../parse');
const validateFbRequestIntegrity = require('../validate-integrity');
const color = require('../console-colors');

module.exports = function fbSetup(api, bot, logError, optionalParser, optionalResponder) {
  let parser = optionalParser || fbParse;
  let responder = optionalResponder || fbReply;

  api.get('/facebook', (request, response) => {
    if (request.params['hub.verify_token'] === request.env.facebookVerifyToken)
      response.type('txt').send(request.params['hub.challenge']);

    logError(`Facebook can't verify the token. It expected '${request.env.facebookVerifyToken}', but got '${request.params['hub.verify_token']}'. Make sure you are using the same token you set in 'facebookVerifyToken' stage env variable.`);
    response.type('txt').send('Error');
  });

  api.post('/facebook', (request, response) => {
    // We are doing verification if FB Secret exist in env because we don't want to break old bots that forgot to add it
    if (request.env.facebookAppSecret && !validateFbRequestIntegrity(request))
      response.status(500).type('txt').send('X-Hub-Signatures does not match');

    let arr = [].concat.apply([], request.body.entry.map(entry => entry.messaging));
    let fbHandle = parsedMessage => {
      if (parsedMessage) {
        var recipient = parsedMessage.sender;

        return bot(parsedMessage, request)
          .then(botResponse => responder(recipient, botResponse, request.env.facebookAccessToken, response))
          .catch(logError);
      }
    };

    return Promise.all(arr.map(message => fbHandle(parser(message))))
      .then(() => response.send('ok'));
  });

  api.addPostDeployStep('facebook', (options, environmentDetails, utils) => {
    return Promise.resolve().then(() => {
        let variables = {};
        let shouldConfigure = options['configure-fb-bot'];

        if(options.facebookVerifyToken && options.facebookAccessToken
            && options.facebookAppSecret && !shouldConfigure) {

            variables.facebookVerifyToken = options.facebookVerifyToken;
            variables.facebookAccessToken = options.facebookAccessToken;
            variables.facebookAppSecret = options.facebookAppSecret;

            return variables;
        }

        if (shouldConfigure) {
          let token, pageAccessToken;

          return Promise.resolve().then(() => {
            if (options.facebookVerifyToken){
              return options.facebookVerifyToken;
            }
            return crypto.randomBytes(8);
          })
          .then(rawToken => {
            token = rawToken.toString('base64').replace(/[^A-Za-z0-9]/g, '');
            variables.facebookVerifyToken = token;
            return variables;
          })
          .then(() => {
            console.log(`\n\n${color.green}Facebook Messenger setup${color.reset}\n`);
            console.log(`\nFollowing info is required for the setup, for more info check the documentation.\n`);
            console.log(`\nYour webhook URL is: ${color.cyan}${environmentDetails.apiUrl}/facebook${color.reset}\n`);
            console.log(`Your verify token is: ${color.cyan}${token}${color.reset}\n`);

            return prompt(['Facebook page access token', 'Facebook App Secret']);
          })
          .then(results => {
            console.log('\n');
            pageAccessToken = results['Facebook page access token'];
            variables.facebookAccessToken: pageAccessToken;
            variables.facebookAppSecret: results['Facebook App Secret'];

            if (!options.facebookAppSecret && !results['Facebook App Secret'])
              console.log(`\n${color.yellow}Deprecation warning:${color.reset} your bot is not using facebook validation. Please re-run with --configure-fb-bot to set it. This will become mandatory in the next major version. See https://github.com/claudiajs/claudia-bot-builder/blob/master/docs/API.md#message-verification for more information.\n`);

            return variables;
          })
          .then(() => rp.post(`https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=${pageAccessToken}`));
        }
      });
    })
      .then(() => return {
          botUrl: `${environmentDetails.apiUrl}/facebook`,
          variables: variables
        };
      );
  });
};
