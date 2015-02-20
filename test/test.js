var test = require('tape');

var credentials = fs.readFileSync(__dirname + '/remtail.json', 'utf-8');
var credentialMap = JSON.parse(credentials);

test('build map of hosts', function (t) {
    var hostPathPairs = [
        'trillworks.com:/var/log/blah.log',
        'trillworks.com:/var/log/wow.log',
        'indeed.com:/var/www/django.log'
    ];
    var hostMap = buildHostMap(hostPathPairs);
    var expectedHostMap = {
        'trillworks.com': {
            paths: ['/var/log/blah.log', '/var/log/wow.log']
        },
        'indeed.com': {
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