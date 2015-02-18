var path = require('path');
var fs = require('fs');
var args = require('./args');

var DEFAULT_CREDENTIALS_LOCATION = path.join(process.env['HOME'], '.remtail.json');

var credentialsFilePath = args._.c || DEFAULT_CREDENTIALS_LOCATION;
var credentials = {};

try {
    var credentialList = JSON.parse(fs.readFileSync(credentialsFilePath));
    credentialList.forEach(function(credential) {
        var credentialMap = {
            user: credential['user']
        };

        if (credential['password']) {
            credentialMap['password'] = credential['password'];
        }

        if (credential['port']) {
            credentialMap['port'] = credential['port'];
        }
        
        if (credential['privateKey']) {
            credentialMap['privateKey'] = credential['privateKey'];
        }

        credentials[credential['hostname']] = credentialMap;
    });
} catch(e) {
    console.log('Could not build credentials map from file at ' + credentialsFilePath);
}

module.exports = credentials;
