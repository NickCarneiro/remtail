var fs = require('fs');
var osenv = require('osenv');


/**
 *
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
            try {
                credentialMap['privateKey'] = fs.readFileSync(credential['privateKey'], 'ascii');
            } catch (e) {
                console.log('Could not read private key file ' + credential['privateKey']);
            }
        }
        // if there is no credentialMap entry for this hostname, put credential in the map, if an entry already, exists
        // overwrite existing properties
        if (credentialMap['hostname'] in masterCredentialsMap) {
            for (var property in credentialMap) {
                masterCredentialsMap[credential['hostname']][property] = credentialMap[property];
            }
        } else {
            masterCredentialsMap[credential['hostname']] = credentialMap;
        }
    });
};


/**
 *
 * @param {object} credentialsMap - an empty object
 * @param {string} sshConfigCredentials - credentials extracted by ssh-config-parser
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
            try {
                var fullPath = credential['IdentityFile'].replace('~', osenv.home());
                standardizedCredential.privateKey = fs.readFileSync(fullPath, 'utf-8');
            } catch(e) {
                console.log('Could not read private key file for ' + hostname);
            }
        }
        if ('Port' in credential) {
            standardizedCredential.port = credential['Port']
        }

        if ('User' in credential) {
            standardizedCredential.user = credential['User']
        }
        credentialsMap[hostname] = standardizedCredential;
    });
    console.log(sshConfigCredentials);
    return credentialsMap;
};


module.exports = {
    addFileCredentials: addFileCredentials,
    buildSshConfigCredentialsMap: buildSshConfigCredentialsMap
};
