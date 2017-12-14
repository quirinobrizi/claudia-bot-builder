'use strict';
const rp = require('minimal-request-promise');

function customReply(message, res, accessToken) {
  // var data = {
  //   bot_id: botId,
  //   text: typeof message === 'string' ? message : message.text
  // };
  //
  // const options = {
  //   headers: {
  //     'content-type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // };
  //
  // return rp.post('https://api.groupme.com/v3/bots/post', options);
  console.log("reply");
  return Promise.resolve().then(() => { return message; });

}

module.exports = customReply;
