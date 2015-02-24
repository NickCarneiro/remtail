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
var osenv = require('osenv');

var DEFAULT_CREDENTIALS_LOCATION = path.join(osenv.home(), '.remtail.json');


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
    var connectionMap = {};
    var hostsSize = 0;
    for (var hostName in hosts) {
        hostsSize++;
        var host = hosts[hostName];

        for (var i in host.paths) {
            var filepath = host.paths[i];
            var tailCommand = "tail -F " + filepath;
            var filename = path.basename(filepath);
            
            console.log('hostname: ' + hostName);
            console.log('command: ' + tailCommand);

            var conn = connectionMap[hostName] || new SshClient();

            // use bind to build a function that takes copies of local vars
            // from this particular iteration of the for loop
            var readyCallback = function(conn, tailCommand, hostName, filename) {
                var host = hosts[hostName];
                conn.exec(tailCommand, function(err, stream) {
                    if (err) {
                        throw err;
                    }

                    stream.on('close', function() {
                        console.log('Connected closed to: ' + hostName);
                        conn.end();
                    }).on('data', function(data) {
                        var dataString = data.toString('utf-8');
                        var lines = dataString.split('\n');
                        lines.forEach(function(line) {
                            if (line) {
                                console.log(colors[host.color](hostName + ' ' + filename) + ' ' + line);
                            }
                        });

                    }).stderr.on('data', function(data) {
                            var dataString = data.toString('utf-8');
                            var lines = dataString.split('\n');
                            lines.forEach(function(line) {
                                console.log(hostName + ' ' + line);
                            });
                        });
                });
            }.bind(this, conn, tailCommand, hostName, filename);
            conn.on('ready', readyCallback);
            
            if (!connectionMap[hostName]) {
                var connectionParams = {
                    host: hostName,
                    port: host.port,
                    username: host.user
                };

                if (!host.user) {
                    connectionParams.username = host.user =
                        readlineSync.question('Username for ' + hostName + ':\n');
                }

                // Authentication Method
                if (host.password) {
                    connectionParams.password = host.password;
                } else if (host.privateKey) {
                    connectionParams.privateKey = host.privateKey;
                    if (host.passphrase) {
                        connectionParams.passphrase = host.passphrase;
                    } else if (host.privateKey.indexOf('-----BEGIN RSA PRIVATE KEY-----') !== -1) {
                        connectionParams.passphrase = host.passphrase =
                            readlineSync.question('ssh key passphrase for ' + hostName + ':\n', {noEchoBack: true});
                    }
                } else {
                    var identifier = connectionParams.username + '@' + hostName;
                    connectionParams.password = host.password =
                        readlineSync.question('Password for ' + identifier + ':\n', {noEchoBack: true});
                }

                conn.connect(connectionParams);
                connectionMap[hostName] = conn;
            }
        }
    }
}


if (require.main === module) {
    main();
}