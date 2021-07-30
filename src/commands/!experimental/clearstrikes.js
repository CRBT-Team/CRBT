const { colors, emojis, links } = require("../../../index");

module.exports.command = {
    name: "clearstrikes",
    module: "moderation",
    aliases: ['strikes_clear','removestrikes','remove_strikes','clear-strikes','clear_strikes'],
    description_enUS: "Clears the strike history of a specified user.",
    usage_enUS: "<user ID | username | @mention (optional)>",
    code: `
$deleteUserVar[strikes;$get[id]]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:
$get[strikes-$getGlobalUserVar[language]]
}

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.success} Cleared $userTag[$get[id]]'s $get[count] strikes]

$let[strikes-enUS;Last 10 strikes:$replaceText[$replaceText[$checkCondition[$get[strikes]==none];false;$replaceText[$replaceText[$splitText[1]
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

$onlyIf[$get[count]!=0;{execute:queryNotFound}]

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
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}