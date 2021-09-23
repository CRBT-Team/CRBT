module.exports.command = {
    name: "$alwaysExecute",
    code: `
$reply[$messageID;
{author:$username[$clientID] - Mini-help:$userAvatar[$clientID;64]}
{description:
$username[$clientID]'s prefix for this server is \`$getServerVar[prefix]\`.
If you don't know how to use CRBT, you can use the \`$getServerVar[prefix]help\` command!
}
{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$stringStartsWith[$getGlobalUserVar[lastCmd];prefix ** ]==false;]
$onlyIf[$checkContains[$checkCondition[$message==<@!$clientID>]$checkCondition[$message==<@$clientID>];true]==true;]
    `}