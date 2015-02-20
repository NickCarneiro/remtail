#!/usr/bin/env node

var SshClient = require('ssh2').Client;
var hosts = require('./lib/hosts');
var colors = require('colors');

// open an ssh connection to every host and run the tail commands
var hostsSize = 0;
for (var hostName in hosts) {
    hostsSize++;
    var host = hosts[hostName];
    var password = host.password;
    var tailCommand = buildTailCommand(host.paths);
    console.log('hostname: ' + hostName);
    console.log('command: ' + tailCommand);
    
    var conn = new SshClient();

    // use bind to build a function that takes copies of local vars
    // from this particular iteration of the for loop
    var readyCallback = function(conn, tailCommand, hostName) {
        conn.exec(tailCommand, function (err, stream) {
            if (err) throw err;
            
            stream.on('close', function (code, signal) {
                console.log('Connected closed to: ' + hostName);
                conn.end();
            }).on('data', function (data) {
                var dataString = data.toString('utf-8');
                var lines = dataString.split('\n');
                lines.forEach(function(line) {
                    if (line) {
                        console.log(hostName.red + ' ' + line);
                    }
                });

            }).stderr.on('data', function (data) {
                var dataString = data.toString('utf-8');
                var lines = dataString.split('\n');
                lines.forEach(function(line) {
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
    } else {
        connectionParams.password = prompt('Password for ' + hostName);
    }
    
    conn.on('ready', readyCallback).connect(connectionParams);
}

if (hostsSize === 0) {
    console.log('usage: ');
    console.log('remtail hostname:/path/to/file hostname2:/path/to/file');
}


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
