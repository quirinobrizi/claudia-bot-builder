'use strict';

const crypto = require('crypto');
const tsscmp = require('tsscmp');

module.exports = function validateFbRequestIntegrity(request) {
  let xHubSignature;
  if (request.headers) {
    xHubSignature = request.headers['X-Hub-Signature'] || request.headers['x-hub-signature'];
  } else {
    xHubSignature = request.get('x-hub-signature');
  }
  const parsedXHubSignature = xHubSignature.split('=');
  try {
    const serverSignature = crypto.createHmac(parsedXHubSignature[0], request.env.facebookAppSecret).update(request.rawBody || request.body).digest('hex');
    return tsscmp(parsedXHubSignature[1], serverSignature);
  } catch (e) {
    if (e instanceof TypeError) {
      return true;
    }
    return false;
  }
};
