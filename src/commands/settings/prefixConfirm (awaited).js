const { emojis, colors, illustrations } = require("../../../index");

module.exports.awaitedCommand = {
    name: "prefixConfirm",
    code: `
$if[$checkContains[$checkCondition[$message==<@!$clientID>]$checkCondition[$message==<@$clientID>];true]==true]

$setGlobalUserVar[lastCmd;prefix]

$if[$stringStartsWith[$getGlobalUserVar[lastCmd];prefix ** $getVar[prefix] **]==true]
$deleteServerVar[prefix]
$else
$setServerVar[prefix;$splitText[2]]
$endif

$editMessage[$splitText[3];
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.success}}
;$channelID]

$deletecommand

$let[title-enUS;${emojis.success} Changed prefix on $serverName]
$let[description-enUS;$username[$clientID] will now use \`$splitText[2]\` as its prefix on this server.]

$textSplit[$getGlobalUserVar[lastCmd]; ** ]

$else

$setGlobalUserVar[lastCmd;prefix]

$editMessage[$splitText[3];
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.error}}
;$channelID]

$let[title-enUS;${emojis.error} Prefix change cancelled]
$let[description-enUS;Due to a wrong response on this confirmation prompt, the prefix couldn't be changed. Try again.]

$textSplit[$getGlobalUserVar[lastCmd]; ** ]

$endif
    `}