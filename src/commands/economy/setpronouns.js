const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "setpronouns",
    aliases: ["pronouns", "set_pronouns", "set-pronouns"],
    module: "economy",
    usage_enUS: "<he/him | she/her | they/them | any | other | ask | username | unspecified>",
    description_enUS: "Changes the pronouns shown on your CRBT profile.",
    examples_enUS: [
        "pronouns they/them",
        "setpronouns username",
        "set-pronouns other"
    ],
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

$onlyIf[$checkContains[$checkCondition[$get[msg]==he/him]$checkCondition[$get[msg]==she/her]$checkCondition[$get[msg]==they/them]$checkCondition[$get[msg]==any]$checkCondition[$get[msg]==other]$checkCondition[$get[msg]==ask]$checkCondition[$get[msg]==username]$checkCondition[$get[msg]==unspecified];true]==true;{execute:args}]

$get[msg;$toLowercase[$replaceText[$message; ;]]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}