var test = require('tape');
var fs = require('fs');
var hostUtils = require('../lib/hosts');
var buildCredentialsMap = require('../lib/creds');


var hostPathPairs = [
    'trillworks.com:/var/log/blah.log',
    'trillworks.com:/var/log/wow.log',
    'indeed.com:/var/www/django.log',
    'yahoo.com:/var/log/whoa.log'
];
var hostMap = hostUtils.buildHostMap(hostPathPairs);

var credentialsFileString = fs.readFileSync(__dirname + '/remtail.json');
var credentialList = JSON.parse(credentialsFileString);
var credentialsMap = buildCredentialsMap(credentialList);

var expectedPrivateKey = fs.readFileSync(__dirname + '/privateKey.txt', 'utf-8');

test('build map of hosts from command line args', function (t) {

    var expectedHostMap = {
        'trillworks.com': {
            color: 'red',
            paths: ['/var/log/blah.log', '/var/log/wow.log']
        },
        'indeed.com': {
            color: 'yellow',
            paths: ['/var/www/django.log']
        },
        'yahoo.com': {
            color: 'green',
            paths: ['/var/log/whoa.log']
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
            privateKey: expectedPrivateKey,
            passphrase: true
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
            port: 22
        },
        'indeed.com': {
            color: 'yellow',
            paths: ['/var/www/django.log']   ,
            user: 'peter',
            password: 'blah',
            port: 22
        },
        'yahoo.com': {
            color: 'green',
            paths: ['/var/log/whoa.log'],
            passphrase: true,
            privateKey: expectedPrivateKey,
            port: 22,
            user: 'ganley'
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
