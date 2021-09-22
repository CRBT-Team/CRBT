const { version } = require("../../package.json");

module.exports.readyCommand = { 
    channel: "738747595438030891",
    code: `
$log[Running $username[$clientID] v${version}]
    `}