const { illustrations } = require("../../../index");

module.exports.command = {
    name: "doabarrelroll",
    module: "fun",
    aliases: ["do_a_barrel_roll"],
    description_enUS: "Do a barrel roll! (secret command)",
    cooldown: "5s",
    code: `
$reply[$messageID;
{image:${illustrations.barrelRoll}}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}