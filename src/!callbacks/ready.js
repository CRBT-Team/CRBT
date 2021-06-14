const { botinfo } = require("../../index");

module.exports.readyCommand = { 
    channel: "738747595438030891",
    code: `
$log[Running $username[$clientID] build ${botinfo.build} / version ${botinfo.version}]
    `}