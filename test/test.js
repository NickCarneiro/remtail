var test = require('tape');
var fs = require('fs');
var hostUtils = require('../lib/hosts');
var credentialUtils = require('../lib/creds');
var parseSshConfig = require('ssh-config-parser');

require('./lib/test-creds');

var hostPathPairs = [
    'trillworks.com:/var/log/blah.log',
    'trillworks.com:/var/log/wow.log',
    'indeed.com:/var/www/django.log',
    'yahoo.com:/var/log/whoa.log',
    'github.com:/var/logs/app1/logs/application.log',
    'github.com:/var/logs/test-app2/logs/application.log'
];
var hostMap = hostUtils.buildHostMap(hostPathPairs);

var credentialsFileString = fs.readFileSync(__dirname + '/remtail.json');
var credentialList = JSON.parse(credentialsFileString);
var credentialsMap = {};
credentialUtils.addFileCredentials(credentialsMap, credentialList);

var expectedPrivateKey = fs.readFileSync(__dirname + '/privateKey.txt', 'utf-8');

test('build map of hosts from command line args', function (t) {

    var expectedHostMap = {
        'trillworks.com': {
            color: 'red',
            paths: ['/var/log/blah.log', '/var/log/wow.log'],
            displayPaths: {
                '/var/log/blah.log': 'blah.log',
                '/var/log/wow.log': 'wow.log'
            }
        },
        'indeed.com': {
            color: 'yellow',
            paths: ['/var/www/django.log'],
            displayPaths: {
                '/var/www/django.log': 'django.log'
            }
        },
        'yahoo.com': {
            color: 'green',
            paths: ['/var/log/whoa.log'],
            displayPaths: {
                '/var/log/whoa.log': 'whoa.log'
            }
        },
        'github.com': {
            color: 'blue',
            paths: ['/var/logs/app1/logs/application.log', '/var/logs/test-app2/logs/application.log'],
            displayPaths: {
                '/var/logs/app1/logs/application.log': 'app1',
                '/var/logs/test-app2/logs/application.log': 'test-app2'
            }
        }
    };
    t.deepEquals(hostMap, expectedHostMap);
    t.end();
});


test('build credentials map from properties file', function (t) {

    var expectedCredentialsMap = {
        'trillworks.com': {
            port: 22,
            user: 'bigtex',
            password: 'hunter2'
        },
        'indeed.com': {
            user: 'peter',
            password: 'blah'
        },
        "yahoo.com": {
            user: 'ganley',
            privateKey: expectedPrivateKey
        }
    };
    t.deepEquals(credentialsMap, expectedCredentialsMap);
    t.end();
});


test('add credentials to hosts map', function (t) {
    hostUtils.addCredentials(hostMap, credentialsMap);

    var expectedHostMap = {
        'trillworks.com': {
            color: 'red',
            paths: ['/var/log/blah.log', '/var/log/wow.log'],
            user: 'bigtex',
            password: 'hunter2',
            port: 22,
            displayPaths: {
                '/var/log/blah.log': 'blah.log',
                '/var/log/wow.log': 'wow.log'
            }
        },
        'indeed.com': {
            color: 'yellow',
            paths: ['/var/www/django.log']   ,
            user: 'peter',
            password: 'blah',
            port: 22,
            displayPaths: {
                '/var/www/django.log': 'django.log'
            }
        },
        'yahoo.com': {
            color: 'green',
            paths: ['/var/log/whoa.log'],
            privateKey: expectedPrivateKey,
            port: 22,
            user: 'ganley',
            displayPaths: {
                '/var/log/whoa.log': 'whoa.log'
            }
        },
        'github.com': {
            color: 'blue',
            paths: ['/var/logs/app1/logs/application.log', '/var/logs/test-app2/logs/application.log'],
            displayPaths: {
                '/var/logs/app1/logs/application.log': 'app1',
                '/var/logs/test-app2/logs/application.log': 'test-app2'
            }
        }
    };
    t.deepEquals(hostMap, expectedHostMap);
    t.end();
});


test('test colors wraparound', function (t) {
    var hostPathPairs = [
        'trillworks.com:/var/log/blah.log',
        'yahoo.com:/var/log/wow.log',
        'google.com:/var/www/django.log',
        'monster.com:/var/www/django.log',
        'indeed.com:/var/www/django.log',
        'linkedin.com:/var/www/django.log',
        'alexa.com:/var/www/django.log',
        'bing.com:/var/www/django.log',
        'microsoft.com:/var/www/django.log',
        'gatorade.com:/var/www/django.log'
    ];
    var hostMap = hostUtils.buildHostMap(hostPathPairs);
    t.equals(hostMap['gatorade.com']['color'], 'yellow');
    t.end();
});


test('build credentials map from ssh_config', function (t) {
    var sshConfigFile = fs.readFileSync(__dirname + '/ssh_config.txt', 'utf-8');
    var sshConfig = parseSshConfig(sshConfigFile);
    var credentialsMap = credentialUtils.buildSshConfigCredentialsMap({}, sshConfig);
    var expectedCredentialsMap = {
        'trillworks.com': {
            user: 'nickc'
        },
        'indeed.com': {
            user: 'maurice',
            privateKey: expectedPrivateKey
        }
    };
    t.deepEquals(credentialsMap, expectedCredentialsMap);
    t.end();
});


test('add ssh config files to hostmap', function (t) {
    var sshConfigFile = fs.readFileSync(__dirname + '/ssh_config.txt', 'utf-8');
    var sshConfig = parseSshConfig(sshConfigFile);
    var credentialsMap = credentialUtils.buildSshConfigCredentialsMap({}, sshConfig);
    var expectedHostMap = {
        'trillworks.com': {
            color: 'red',
            paths: ['/var/log/blah.log', '/var/log/wow.log'],
            displayPaths: {
                '/var/log/blah.log': 'blah.log',
                '/var/log/wow.log': 'wow.log'
            },
            user: 'nickc',
            port: 22
        },
        'indeed.com': {
            color: 'yellow',
            paths: ['/var/www/django.log'],
            displayPaths: {
                '/var/www/django.log': 'django.log'
            },
            privateKey: expectedPrivateKey,
            user: 'maurice',
            port: 22
        },
        'yahoo.com': {
            color: 'green',
            paths: ['/var/log/whoa.log'],
            displayPaths: {
                '/var/log/whoa.log': 'whoa.log'
            }
        },
        'github.com': {
            color: 'blue',
            paths: ['/var/logs/app1/logs/application.log', '/var/logs/test-app2/logs/application.log'],
            displayPaths: {
                '/var/logs/app1/logs/application.log': 'app1',
                '/var/logs/test-app2/logs/application.log': 'test-app2'
            }
        }
    };
    var hostMap = hostUtils.buildHostMap(hostPathPairs);
    hostUtils.addCredentials(hostMap, credentialsMap);
    t.deepEquals(hostMap, expectedHostMap);
    t.end();
});