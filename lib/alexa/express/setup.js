'use strict';

const prompt = require('souffleur');
const alexaParse = require('../parse');
const alexaReply = require('../reply');
const color = require('../../console-colors');
const envUtils = require('../../utils/env-utils');

module.exports = function alexaSetup(api, bot, logError, optionalParser, optionalResponder) {

    let parser = optionalParser || alexaParse;
    let responder = optionalResponder || alexaReply;

    api.post('/alexa', (request, response) => {
        return bot(parser(request.body), request)
            .then(botReply => responder(botReply, envUtils.decode(request.env.alexaAppName || ''), response))
            .catch(logError);
    });

    api.addPostDeployStep('alexa', (options, environmentDetails, utils) => {
        let alexaAppName = options.alexaAppName;
        return Promise.resolve()
            .then(() => {
                if (options['configure-alexa-skill'] && !alexaAppName) {
                    console.log(`\n\n${color.green}Alexa skill command setup${color.reset}\n`);
                    console.log(`\nConfigure your Alexa Skill endpoint to HTTPS and set this URL:.\n`);
                    console.log(`\n${color.cyan}${environmentDetails.apiUrl}/alexa${color.reset}\n`);
                    console.log(`\nIn the SSL Certificate step, select "${color.dim}My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority${color.reset}".\n`);

                    return prompt(['Alexa bot name'])
                        .then(results => {
                            console.log(`\n`);
                            return Promise.resolve({
                                alexaAppName: envUtils.encode(results['Alexa bot name'])
                            });
                        });
                } else {
                    return Promise.resolve({
                        alexaAppName: envUtils.encode(alexaAppName)
                    });
                }
            })
            .then(vars => {
                return {
                    botUrl: `${environmentDetails.apiUrl}/alexa`,
                    variables: vars
                }
            });
    });
};
