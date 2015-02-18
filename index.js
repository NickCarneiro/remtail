#!/usr/bin/env node

var SshClient = require('ssh2').Client;
var hosts = require('./lib/hosts');

// open an ssh connection to every host and run the tail commands
for (var hostName in hosts) {
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
                console.log(hostName + ' -- ' + data.toString('utf-8'));
            }).stderr.on('data', function (data) {
                console.log(hostName + ' -- ' + data.toString('utf-8'));
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
