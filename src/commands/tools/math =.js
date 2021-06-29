module.exports.command = {
    name: "=",
    nonPrefixed: true,
    module: "tools",
    description_enUS: "Calculates your input.",
    usage_enUS: "<math calculation (e.g. 4+3)>",
    code: `
$reply[$messageID;
{title:= $replaceText[$math[$get[calc]];Infinity;∞]}
{color:$getGlobalUserVar[color]}
;no]

$let[calc;$replaceText[$replaceText[$replaceText[$replaceText[$message;x;*];#COLON#;/]; ;];,;]]

$suppressErrors
$onlyIf[$isNumber[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;+;];-;];x;];*;];/;];);];(;]]==true;]
$argsCheck[>1;]
$onlyIf[$getGlobalUserVar[blocklisted]==false;]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;]
$setGlobalUserVar[lastCmd;$commandName]
    `}