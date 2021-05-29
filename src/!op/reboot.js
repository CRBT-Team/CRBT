const colors = require('../../json/colors.json');
const emojis = require('../../json/emojis.json');

module.exports.command = {
    name: "reboot",
    aliases: ["re"],
    code: `
$reboot[server.js]
$addCmdReactions[${emojis.general.success}]
$onlyForIDs[$botOwnerID;{execute:owneronly}]
`}