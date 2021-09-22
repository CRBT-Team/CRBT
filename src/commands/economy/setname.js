const { emojis, colors } = require("../../../index");
const blockedWords = require("../../../data/misc/badwords.json");

module.exports.command = {
    name: "setname",
    aliases: ["name", "set_name", "set-name"],
    module: "economy",
    usage_enUS: "<new name (may include CRBTscript tags)>",
    description_enUS: "Changes the name shown on your CRBT profile.",
    code: `
$if[$message==$getVar[profile_name]]
$deleteGlobalUserVar[profile_name]
$else
$setGlobalUserVar[profile_name;$message]
$endif

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}

{field:$get[previous-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$checkCondition[$charCount[$get[old]]>40];true;$cropText[$get[old];40]...];false;$get[old]] \`\`\`
$getGlobalUserVar[profile_name]\`\`\`
:yes}

{field:$get[new-$getGlobalUserVar[language]]:
$get[new] \`\`\`
$message\`\`\`
:yes}

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.success} Profile name changed]
$let[previous-enUS;Previous]
$let[new-enUS;New]

$let[old;$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_name];<user.name>;$username];<user.id>;$authorID];<user.tag>;$userTag[$authorID]];<var.purplets>;$getGlobalUserVar[user_bank;$authorID]]]

$onlyIf[$checkContains[${blockedWords};$message]==false;{execute:noBadWords}]
$onlyIf[$charCount[$toLowercase[$get[new]]]<=40;{execute:tooLong}]
$onlyIf[$charCount[$toLowercase[$get[cleanedUp]]]>=5;{execute:tooShort}]

$let[cleanedUp;$djsEval['$replaceText[$get[plainNew];';]'.trim().replace(/[u200B-u200DuFEFF]/g, '');yes]]

$let[plainNew;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[new];||;];* ;]; *;]; _;];_ ;];*;];_;]]

$let[new;$replaceText[$replaceText[$replaceText[$replaceText[$message;<user.name>;$username[$authorID]];<user.id>;$authorID];<user.tag>;$userTag[$authorID]];<var.purplets>;$getGlobalUserVar[user_bank;$authorID]]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}