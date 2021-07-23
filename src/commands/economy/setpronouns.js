const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "setpronouns",
    aliases: ["pronouns", "set_pronouns", "set-pronouns"],
    module: "economy",
    usage_enUS: "<he/him | she/her | they/them | any | other | ask | username | unspecified>",
    description_enUS: "Changes the pronouns shown on your CRBT profile.",
    code: `
$if[$toLowercase[$message]==$getVar[profile_about]]
$deleteGlobalUserVar[profilePronouns]
$else
$setGlobalUserVar[profilePronouns;$replaceText[$toLowercase[$get[new]];/; ]]
$endif

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}

{field:$get[previous-$getGlobalUserVar[language]]:
$replaceText[$get[old];Username;Use my username]
:yes}

{field:$get[new-$getGlobalUserVar[language]]:
$replaceText[$get[new];Username;Use my username]
:yes}

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.success} Pronouns changed]
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
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}