module.exports.command = {
    name: "$alwaysExecute",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$clientID;64]}
{description:$get[desc-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$username[$clientID] - Mini-help]
$let[desc-enUS;$username[$clientID]'s prefix for this server is \`$getServerVar[prefix]\`.
If you don't know how to use CRBT, you can use the \`$getServerVar[prefix]help\` command!]

$onlyIf[$checkContains[$checkCondition[$message==<@!$clientID>]$checkCondition[$message==<@$clientID>];true]==true;]
    `}