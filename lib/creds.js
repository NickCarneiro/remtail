var fs = require('fs');

var buildCredentialsMap = function(credentialList) {


    var credentials = {};

    credentialList.forEach(function (credential) {
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
            try {
                credentialMap['privateKey'] = fs.readFileSync(credential['privateKey'], 'ascii');
            } catch (e) {
                console.log('Could not read private key file ' + credential['privateKey']);
            }
        }

        credentials[credential['hostname']] = credentialMap;
    });

    return credentials;
};


module.exports = buildCredentialsMap;