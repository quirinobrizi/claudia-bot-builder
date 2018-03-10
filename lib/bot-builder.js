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
const googleTemplate = require('./google/format-message');

let logError = function (err) {
    console.error(err);
};

module.exports = function botBuilder(messageHandler, options, optionalLogError) {
    logError = optionalLogError || logError;

    const apiBuilder = new ApiBuilder(),
        api = apiBuilder.build(options),
        messageHandlerPromise = function (message, originalApiBuilderRequest) {
            return Promise.resolve(message).then(message => messageHandler(message, originalApiBuilderRequest));
        };

    if (options.aws) {
        api.get('/', () => 'Ok');
    } else if (options.express) {
        api.get('/', (req, res) => {
            res.send('Ok');
        })
    }

    let isEnabled = function isEnabled(platform) {
        return !options || !options.platforms || options.platforms.indexOf(platform) > -1;
    };

    let setupPlatform = function (platform) {
        console.log("setting up %s platform", platform);
        if (platform === 'slackSlashCommand') {
            platform = 'slack';
        }
        require(util.format("./%s/setup", platform))(api, messageHandlerPromise, logError);
    }

    if (options && options.platforms) {
        options.platforms.map(setupPlatform);
    } else {
        ['facebook', 'custom', 'slack', 'telegram', 'skype', 'twilio', 'kik', 'groupme', 'line', 'viber', 'alexa'].map(setupPlatform);
    }

    if (options.express) {
        // TODO: apiUrl should be dynamic
        let protocol = options.protocol || 'http',
            host = options.host || 'localhost',
            port = options.port || 3000;
        api.postDeploy(options, {
                apiUrl: `${protocol}://${host}:${port}`
            })
            .then(results => {
                Object.keys(results).map(key => console.log(`${key} bot listening on ${results[key].botUrl}`));
                api.defineEnvironment(results);
            })
            .catch(logError);
    }

    return api;
};

module.exports.fbTemplate = fbTemplate;
module.exports.slackTemplate = slackTemplate;
module.exports.telegramTemplate = telegramTemplate;
module.exports.viberTemplate = viberTemplate;
module.exports.skypeTemplate = skypeTemplate;
module.exports.AlexaTemplate = AlexaTemplate;
module.exports.slackDelayedReply = slackDelayedReply;
module.exports.googleTemplate = googleTemplate;