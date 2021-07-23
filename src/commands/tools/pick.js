module.exports.command = {
    name: "pick",
    module: "tools",
    aliases: ["decide", "random", "sack"],
    description_enUS: "Picks something from the given values at random.",
    usage_enUS: "<values (separated by commas and/or newlines) (2 minimum)>",
    code: `
$reply[$messageID;
{title:"$get[random]" was picked from $getTextSplitLength options.}
{color:$getGlobalUserVar[color]}
;no]

$let[random;$randomText[$joinSplitText[;]]]

$onlyIf[$getTextSplitLength>=2;{execute:args}]

$textSplit[$get[options];$get[key]]

$let[options;$replaceText[$replaceText[$replaceText[$message;\n;, ];, ;,];,;$get[key]]]

$let[key;$randomString[10]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}