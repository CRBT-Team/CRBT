module.exports.command = {
    name: "strikes",
    module: "moderation",
    aliases: ['infractions','warns','strikecount', 'history', "modlog"],
    description_enUS: "Gets the history of your strikes or of someone else's.",
    usage_enUS: "<user ID | username | @mention (optional)>",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$get[id];64]}
{description:$get[protip-$getGlobalUserVar[language]]}
{field:$get[strikes-$getGlobalUserVar[language]]:no}
{color:$getGlobalUserVar[color]}
;no]

$let[protip-enUS;$replaceText[$replaceText[$hasPerms[$authorID;admin];false;];true;You can clear any strike by simply using \`$getServerVar[prefix]clearstrike <strike number> <user ID | @mention>\`, or \`$getServerVar[prefix]clearstrikes <user ID | @mention>\` to remove all of them.]]
$let[title-enUS;$userTag[$get[id]] - Strikes]
$let[strikes-enUS;$get[count] strike$replaceText[$replaceText[$checkCondition[$get[count]==1];true;];false;s]:$replaceText[$get[strikes];none;Nothing to see here... (Rightfully!)]]

$let[strikes;$replaceText[$replaceText[$checkContains[$getUserVar[strikelog;$get[id]];|];false;none];true;$replaceText[$getUserVar[strikelog;$get[id]];|;\n]]]
$let[count;$math[$getTextSplitLength-1]]
$textSplit[$getUserVar[strikelog;$get[id]];|]

$if[$message==]
    $let[id;$authorID]
$else
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message;no]!=undefined;{execute:usernotfound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}