const { emojis } = require("../../../index");

module.exports.command = {
    name: "reboot",
    aliases: ["re"],
    code: `
$reboot[server.js]
$addCmdReactions[${emojis.general.success}]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
`}