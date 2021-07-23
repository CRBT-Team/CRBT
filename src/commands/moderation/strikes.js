module.exports.command = {
    name: "strikes",
    module: "moderation",
    aliases: ['infractions','warns','strikecount', 'history', "modlog"],
    description_enUS: "Gets the history of your strikes or of someone else's.",
    usage_enUS: "<user ID | username | @mention (optional)>",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$get[id];64]}
$if[$hasPerms[$authorID;admin]==true]
{description:$get[protip-$getGlobalUserVar[language]]}
$endif
{field:$get[strikes-$getGlobalUserVar[language]]:no}

{color:$getGlobalUserVar[color]}
;no]

$let[protip-enUS;$replaceText[$replaceText[$checkCondition[$get[count]==0];true;];false;You can clear a user's strikes using \`$getServerVar[prefix]clearstrikes <user ID | @mention>\`.]]

$let[title-enUS;$userTag[$get[id]] - Strikes]

$let[strikes-enUS;$replaceText[$replaceText[$checkCondition[$get[count]>10];false;Strike$replaceText[$replaceText[$checkCondition[$get[count]==1];true;];false;s] ($get[count])];true;Last 10 strikes (out of $get[count])]:
$replaceText[$replaceText[$checkCondition[$get[strikes]==none];false;$replaceText[$replaceText[$splitText[1]
$splitText[2]
$splitText[3]
$splitText[4]
$splitText[5]
$splitText[6]
$splitText[7]
$splitText[8]
$splitText[9]
$splitText[10];> - ;> • ]; - <t:; • <t:]];true;Nothing to see here... (Rightfully so!)]]

$textSplit[$get[strikes];\n]

$let[strikes;$replaceText[$replaceText[$checkContains[$getUserVar[strikes;$get[id]];|];false;none];true;$replaceText[• $replaceText[$getUserVar[strikes;$get[id]]a;|a;];|;\n• ]]]

$let[count;$math[$getTextSplitLength-1]]

$textSplit[$getUserVar[strikes;$get[id]];|]

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

/*

$replaceText[$get[strikes];none;Nothing to see here... (Rightfully!)]
*/