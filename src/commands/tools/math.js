module.exports.command = {
    name: "calc",
    module: "tools",
    aliases: ["=", "math", "calculate"],
    description_enUS: "Calculates your input.",
    usage_enUS: "<math calculation (e.g. 4+3)>",
    code: `
$reply[$messageID;
{title:= $replaceText[$math[$get[calc]];Infinity;∞]}
{color:$getGlobalUserVar[color]}
;no]

$let[calc;$replaceText[$replaceText[$replaceText[$replaceText[$message;x;*];#COLON#;/]; ;];,;]]

$onlyIf[$isNumber[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;+;];-;];x;];*;];/;];);];(;]]==true;{execute:args}]
$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}