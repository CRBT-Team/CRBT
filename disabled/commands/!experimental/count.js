const {colors} = require("../../../index");

module.exports.command = {
    name: "count",
    aliases: ["counter"],
    module: "tools",
    description_enUS: "Creates a new counter. Click on the buttons to add or remove 1 to the counter.\nThis is mainly a test of the Discord components, expect some bugs.",
    code: `
$setUserVar[lastCmd;$botLastMessageID;$clientID;$guildID]

$apiMessage[;
{title:Counter: 0}
{color:${colors.default}}
;{actionRow:+1,2,3,plus:-1,2,4,minus}
;$messageID:false;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}