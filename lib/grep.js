var colors = require('colors');

function highlightString(logLine, re) {
    logLine = logLine.replace(re, function(match) {
        return colors.red(match)
    });
    return logLine;
}

module.exports = {
    highlightString: highlightString
};
