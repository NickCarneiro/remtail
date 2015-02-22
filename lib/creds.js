

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
            credentialMap['privateKey'] = credential['privateKey'];
        }

        credentials[credential['hostname']] = credentialMap;
    });

    return credentials;
};


module.exports = buildCredentialsMap;