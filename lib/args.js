var parseArgs = require('minimist');

var args = parseArgs(process.argv);

// chop off '/usr/local/bin/node', and '/Users/nickc/development/remtail/index.js'
args._ = args._.slice(2);

module.exports = args;
