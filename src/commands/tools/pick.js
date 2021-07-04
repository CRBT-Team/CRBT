module.exports.command = {
    name: "pick",
    module: "tools",
    aliases: ["decide", "random", "sack"],
    description_enUS: "Picks something from the given values at random.",
    usage_enUS: "<values (seperated by commas and/or newlines) (2 minimum)>",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;__$get[random]__ was picked from the $getTextSplitLength options!]
$let[random;$randomText[$joinSplitText[;]]]

$onlyIf[$getTextSplitLength>=2;{execute:args}]

$textSplit[$get[text];$get[key]]

$let[text;$replaceText[$replaceText[$replaceText[$message;\n;,];, ;,];,;$get[key]]]
$let[key;$randomString[10]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}