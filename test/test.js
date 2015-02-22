var test = require('tape');
var fs = require('fs');
var hostUtils = require('../lib/hosts');
var credentials = fs.readFileSync(__dirname + '/remtail.json', 'utf-8');
var credentialMap = JSON.parse(credentials);

test('build map of hosts from command line args', function (t) {
    var hostPathPairs = [
        'trillworks.com:/var/log/blah.log',
        'trillworks.com:/var/log/wow.log',
        'indeed.com:/var/www/django.log'
    ];
    var hostMap = hostUtils.buildHostMap(hostPathPairs);
    var expectedHostMap = {
        'trillworks.com': {
            color: 'red',
            paths: ['/var/log/blah.log', '/var/log/wow.log']
        },
        'indeed.com': {
            color: 'yellow',
            paths: ['/var/www/django.log']
        }
    };
    t.deepEquals(hostMap, expectedHostMap);
    t.end();
});


test('build credentials map from properties file', function (t) {

    t.end();
});


test('add credentials to hosts map', function (t) {

    t.end();
});