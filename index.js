#!/usr/bin/env node

/**
 * High level explanation:
 *  Get credentials from credentials file and arguments and create a credentials map
 *  Get hosts information from arguments and build a hosts map
 *  Add the credentials map data to the hosts map
 *  Connect to every host in the hosts map
 */
var SshClient = require('ssh2').Client;
var hostUtils = require('./lib/hosts');
var buildCredentialsMap = require('./lib/creds');
var args = require('./lib/args');
var colors = require('colors');
var readlineSync = require('readline-sync');
var path = require('path');
var fs = require('fs');

var DEFAULT_CREDENTIALS_LOCATION = path.join(process.env['HOME'], '.remtail.json');



/**
 * Builds an executable tail command
 *
 * @param {array} paths - an array of file paths to tail out
 */
function buildTailCommand(paths) {
    var command = 'tail';
    paths.forEach(function(path) {
        command += ' -F ' + path;
    });
    return command;
}


function printUsage() {
    console.log('usage: ');
    console.log('remtail hostname:/path/to/file hostname2:/path/to/file');
}


function main() {

    if (args._.length === 0 || args.help) {
        printUsage();
        process.exit();
    }

    var hosts = hostUtils.buildHostMap(args._);
    var credentialsFilePath = args._.c || DEFAULT_CREDENTIALS_LOCATION;
    var credentialsMap = {};
    try {
        var credentialsFileString = fs.readFileSync(credentialsFilePath, 'utf-8');
        var credentialList = JSON.parse(credentialsFileString);
        credentialsMap = buildCredentialsMap(credentialList);
    } catch (e) {
        console.log('Could not find or parse ' + credentialsFilePath);
    }
    hostUtils.addCredentials(hosts, credentialsMap);

// open an ssh connection to every host and run the tail commands
    var hostsSize = 0;
    for (var hostName in hosts) {
        hostsSize++;
        var host = hosts[hostName];
        var tailCommand = buildTailCommand(host.paths);
        console.log('hostname: ' + hostName);
        console.log('command: ' + tailCommand);

        var conn = new SshClient();

        // use bind to build a function that takes copies of local vars
        // from this particular iteration of the for loop
        var readyCallback = function (conn, tailCommand, hostName) {
            var host = hosts[hostName];
            conn.exec(tailCommand, function (err, stream) {
                if (err) {
                    throw err;
                }

                stream.on('close', function () {
                    console.log('Connected closed to: ' + hostName);
                    conn.end();
                }).on('data', function (data) {
                    var dataString = data.toString('utf-8');
                    var lines = dataString.split('\n');
                    lines.forEach(function (line) {
                        if (line) {
                            console.log(colors[host.color](hostName) + ' ' + line);
                        }
                    });

                }).stderr.on('data', function (data) {
                        var dataString = data.toString('utf-8');
                        var lines = dataString.split('\n');
                        lines.forEach(function (line) {
                            console.log(hostName + ' ' + line);
                        });
                    });
            });
        }.bind(this, conn, tailCommand, hostName);

        var connectionParams = {
            host: hostName,
            port: host.port,
            username: host.user
        };

        if (host.password) {
            connectionParams.password = host.password;
        } else if (host.privateKey) {
            connectionParams.privateKey = host.privateKey;
            if (host.privateKey.indexOf('-----BEGIN RSA PRIVATE KEY-----') !== -1) {
                connectionParams.passphrase =
                    readlineSync.question('ssh key passphrase for ' + hostName + ':\n', {noEchoBack: true});
            }
        } else {
            connectionParams.username = readlineSync.question('Username for ' + hostName + ':\n');
            connectionParams.password = readlineSync.question('Password for ' + connectionParams.username +
            '@' + hostName + ':\n', {noEchoBack: true});
        }

        conn.on('ready', readyCallback).connect(connectionParams);
    }
}


if (require.main === module) {
    main();
}