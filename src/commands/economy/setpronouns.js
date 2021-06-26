const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "setpronouns",
    aliases: ["pronouns", "set_pronouns", "set-pronouns"],
    module: "economy",
    usage_enUS: "<he/him | she/her | they/them | any | other | ask | username | unspecified>",
    description_enUS: "Changes the pronouns shown on your CRBT profile.",
    code: `
$setGlobalUserVar[profilePronouns;$replaceText[$toLowercase[$get[new]];/; ]]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}

{field:$get[previous-$getGlobalUserVar[language]]:
$get[old]
:yes}

{field:$get[new-$getGlobalUserVar[language]]:
$get[new]
:yes}

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.general.success} Pronouns changed]
$let[previous-enUS;Previous]
$let[new-enUS;New]

$let[old;$replaceText[$toLocaleUppercase[$getGlobalUserVar[profilePronouns]]; ;/]]

$if[$checkContains[$toLowercase[$replaceText[$message; ;]];he/him;she/her;they/them]==true]
$let[new;$toLocaleUppercase[$splitText[1]]/$toLocaleUppercase[$splitText[2]]]
$else
$let[new;$toLocaleUppercase[$splitText[1]]]
$endif

$textSplit[$replaceText[$toLowercase[$message]; ;];/]

$onlyIf[$checkContains[$toLowercase[$replaceText[$message; ;]];he/him;she/her;they/them;any;other;ask;username;unspecified]==true;{execute:args}]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}