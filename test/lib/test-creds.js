var credentialUtil = require('../../lib/creds');
var fs = require('fs');
var path = require('path');
var test = require('tape');

var SSH_CONFIG_FILE = path.join(__dirname, '..', 'ssh_config.txt');
var GAURAV_SSH_CONFIG_FILE = path.join(__dirname, '..', 'gaurav_ssh_config.txt');
var REMTAIL_JSON_FILE = path.join(__dirname, '..', 'remtail.json');
var PRIVATE_KEY_FILE = path.join(__dirname, '..', 'privateKey.txt');

var SSH_CONFIG_CONTENTS = fs.readFileSync(SSH_CONFIG_FILE, 'UTF-8');
var GAURAV_SSH_CONFIG_CONTENTS = fs.readFileSync(GAURAV_SSH_CONFIG_FILE, 'UTF-8');
var REMTAIL_JSON_CONTENTS = fs.readFileSync(REMTAIL_JSON_FILE, 'UTF-8');
var PRIVATE_KEY_CONTENTS = fs.readFileSync(PRIVATE_KEY_FILE, 'UTF-8');

var SSH_CONFIG = credentialUtil.parseSshConfig(SSH_CONFIG_CONTENTS);
var REMTAIL_JSON = JSON.parse(REMTAIL_JSON_CONTENTS);

test('ssh config parsing', function(t) {
    var expectedSshConfig = [
        {
            Host: 'trillworks',
            HostName: 'trillworks.com',
            User: 'nickc'
        }, {
            Host: 'globcong',
            HostName: 'globcong.com',
            User: 'maurice',
            IdentityFile: 'test/privateKey.txt'
        }
    ];

    var sshConfig = credentialUtil.parseSshConfig(SSH_CONFIG_CONTENTS);

    t.deepEquals(sshConfig, expectedSshConfig);
    t.end();
});


test('basic ssh credentials map', function(t) {
    var expectedCredentialsMap = {
        'trillworks.com': {
            user: 'nickc'
        },
        'globcong.com': {
            user: 'maurice',
            privateKey: PRIVATE_KEY_CONTENTS
        }
    };

    var credentialsMap = credentialUtil.buildSshConfigCredentialsMap({}, SSH_CONFIG);

    t.deepEquals(credentialsMap, expectedCredentialsMap);
    t.end();
});


test('basic remtail credentials map', function (t) {
    var expectedCredentialsMap = {
        'trillworks.com': {
            port: 22,
            user: 'bigtex',
            password: 'hunter2'
        },
        'globcong.com': {
            user: 'peter',
            password: 'blah'
        },
        "yahoo.com": {
            user: 'ganley',
            privateKey: PRIVATE_KEY_CONTENTS
        }
    };

    var credentialsMap = credentialUtil.addFileCredentials({}, REMTAIL_JSON);

    t.deepEquals(credentialsMap, expectedCredentialsMap);
    t.end();
});


test('merging credentials maps', function(t) {
    var expectedCredentialsMap = {
        'trillworks.com': {
            port: 22,
            user: 'bigtex',
            password: 'hunter2'
        },
        'globcong.com': {
            user: 'peter',
            password: 'blah',
            privateKey: PRIVATE_KEY_CONTENTS
        },
        "yahoo.com": {
            user: 'ganley',
            privateKey: PRIVATE_KEY_CONTENTS
        }
    };

    var credentialsMap = {};
    credentialUtil.buildSshConfigCredentialsMap(credentialsMap, SSH_CONFIG);
    credentialUtil.addFileCredentials(credentialsMap, REMTAIL_JSON);

    t.deepEquals(credentialsMap, expectedCredentialsMap);
    t.end();
});


test('gaurav ssh config with ForwardAgent entry', function(t) {
    var expectedCredentialsMap = {
        'ggmathur.ausoff.globcong.net': {
            user: 'gaurav',
            privateKey: PRIVATE_KEY_CONTENTS
        },
        'tst-user1.globcong.net': {
            user: 'gaurav',
            privateKey: PRIVATE_KEY_CONTENTS
        },
        'tst-user2.globcong.net': {
            user: 'gaurav',
            privateKey: PRIVATE_KEY_CONTENTS
        },
        'tst-svc1.globcong.net': {
            user: 'gaurav',
            privateKey: PRIVATE_KEY_CONTENTS
        },
        'tst-svc2.globcong.net': {
            user: 'gaurav',
            privateKey: PRIVATE_KEY_CONTENTS
        }
    };


    var gauravSshConfig = credentialUtil.parseSshConfig(GAURAV_SSH_CONFIG_CONTENTS);
    var credentialsMap = credentialUtil.buildSshConfigCredentialsMap({}, gauravSshConfig);

    t.deepEquals(credentialsMap, expectedCredentialsMap);
    t.end();
});