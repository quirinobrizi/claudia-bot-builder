'use strict';

const util = require('util');

const ApiBuilder = require('exa-api-builder');

const fbTemplate = require('./facebook/format-message');
const slackTemplate = require('./slack/format-message');
const telegramTemplate = require('./telegram/format-message');
const viberTemplate = require('./viber/format-message');
const skypeTemplate = require('./skype/format-message');
const AlexaTemplate = require('alexa-message-builder');
const slackDelayedReply = require('./slack/delayed-reply');

let logError = function (err) {
  console.error(err);
};

module.exports = function botBuilder(messageHandler, options, optionalLogError) {
  logError = optionalLogError || logError;

  const apiBuilder = new ApiBuilder(),
    api = apiBuilder.build(options),
    handler = options.aws ? 'aws' : 'express',
    messageHandlerPromise = function (message, originalApiBuilderRequest) {
      return Promise.resolve(message).then(message => messageHandler(message, originalApiBuilderRequest));
    };

  if(options.aws) {
      api.get('/', () => 'Ok');
  } else if (options.express) {
      api.get('/', (req, res) => { res.send('Ok'); })
  }

  let isEnabled = function isEnabled(platform) {
    return !options || !options.platforms || options.platforms.indexOf(platform) > -1;
  };

  let setupPlatform = function(platform) {
      console.log("setting up %s platform", platform);
      if(platform === 'slackSlashCommand') {
          platform = 'slack';
      }
      require(util.format("./%s/%s/setup", platform, handler))(api, messageHandlerPromise, logError);
  }

  if(options && options.platforms) {
      options.platforms.map(setupPlatform);
  } else {
      ['facebook', 'custom', 'slack', 'telegram', 'skype', 'twilio', 'kik', 'groupme', 'line', 'viber', 'alexa'].map(setupPlatform);
  }

  api.postDeploy(options, {
      apiUrl: 'http://localhost:3000'
  })
    .then(result => api.defineEnvironment(result) )
    .catch(logError);

  return api;
};

module.exports.fbTemplate = fbTemplate;
module.exports.slackTemplate = slackTemplate;
module.exports.telegramTemplate = telegramTemplate;
module.exports.viberTemplate = viberTemplate;
module.exports.skypeTemplate = skypeTemplate;
module.exports.AlexaTemplate = AlexaTemplate;
module.exports.slackDelayedReply = slackDelayedReply;
