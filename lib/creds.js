var fs = require('fs');
var osenv = require('osenv');
var logger = require('winston');
var sshConfig = require('ssh-config');

/**
 * Standardize reading of private key files
 *
 * @param {string} identityFile The path to the private key
 * @returns {string} The contents of the file if it exists
 */
var readPrivateKey = function(identityFile) {
    var filePath = identityFile.replace('~', osenv.home());
    try {
        return fs.readFileSync(filePath, 'ascii');
    } catch (e) {
        logger.error('Failed to read private key [' + filePath + ']');
        return '';
    }
};

/**
 * @param {object} masterCredentialsMap - a mapping of hostname to credentials object
 * @param {Array} credentialList - an array of credential objects
 * @returns {*}
 */
var addFileCredentials = function(masterCredentialsMap, credentialList) {
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
            credentialMap['privateKey'] = readPrivateKey(credential['privateKey']);
        }

        // if there is no credentialMap entry for this hostname, put credential in the map, if an entry already, exists
        // overwrite existing properties
        if (credential['hostname'] in masterCredentialsMap) {
            for (var property in credentialMap) {
                masterCredentialsMap[credential['hostname']][property] = credentialMap[property];
            }
        } else {
            masterCredentialsMap[credential['hostname']] = credentialMap;
        }
    });
    return masterCredentialsMap;
};


/**
 * @param {object} credentialsMap - an empty object
 * @param {Array} sshConfigCredentials - credentials extracted by ssh-config-parser
 */
var buildSshConfigCredentialsMap = function(credentialsMap, sshConfigCredentials) {
    sshConfigCredentials.forEach(function(credential) {
        var standardizedCredential = {};
        var hostname;

        if ('HostName' in credential) {
            hostname = credential['HostName'];
        } else {
            console.log('Missing HostName in ssh config for ' + credential['Host']);
            return;
        }

        if ('IdentityFile' in credential) {
            standardizedCredential.privateKey = readPrivateKey(credential['IdentityFile']);
        }

        if ('Port' in credential) {
            standardizedCredential.port = credential['Port'];
        }

        if ('User' in credential) {
            standardizedCredential.user = credential['User'];
        }
        credentialsMap[hostname] = standardizedCredential;
    });
    return credentialsMap;
};


//
function objectToArray(obj) {
    var arr = [];
    for (var key in obj) {
        // Remove the length property set by the ssh-config package.
        if (key !== 'length') {
            arr.push(obj[key]);
        }
    }
    return arr;
}


function parseSshConfig(sshConfigFileContents) {
    // Previously we were using a library that parsed ssh config files into arrays.
    // Mimic that behavior here so the rest of the code doesn't need to change.
    return objectToArray(sshConfig.parse(sshConfigFileContents));
}


module.exports = {
    addFileCredentials: addFileCredentials,
    buildSshConfigCredentialsMap: buildSshConfigCredentialsMap,
    parseSshConfig: parseSshConfig
};


