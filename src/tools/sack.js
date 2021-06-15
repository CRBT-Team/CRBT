module.exports.command = {
    name: "sack",
    module: "tools",
    aliases: ["decide", "random"],
    description_enUS: "Picks something off the sack at random.",
    usage_enUS: "<values (seperated by commas and/or newlines)>",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;You pulled __$get[random]__ out of the sack.]
$let[random;$randomText[$joinSplitText[;]]]

$textSplit[$get[text];$get[key]]

$let[text;$replaceText[$replaceText[$replaceText[$message;\n;,];, ;,];,;$get[key]]]
$let[key;$randomString[10]]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
    `}