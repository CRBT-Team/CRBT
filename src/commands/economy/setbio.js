const { emojis, colors } = require("../../../index");
const bad = require("../../../data/misc/badwords.json");

module.exports.command = {
    name: "setbio",
    aliases: ["bio", "set_about", "about", "set_description", "description", "set_bio", "setabout", "set-bio", "set-about", "set-description", "setdescription", "set_description"],
    module: "economy",
    usage_enUS: "<new bio (may include CRBTscript tags)>",
    description_enUS: "Changes your bio shown on your CRBT profile.",
    code: `
$if[$message==$getVar[profile_about]]
$deleteGlobalUserVar[profile_about]
$else
$setGlobalUserVar[profile_about;$message]
$endif

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}

{field:$get[previous-$getGlobalUserVar[language]]:
$get[old] \`\`\`
$getGlobalUserVar[profile_about]\`\`\`
:yes}

{field:$get[new-$getGlobalUserVar[language]]:
$get[new] \`\`\`
$message\`\`\`
:yes}

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.success} Profile bio changed]
$let[previous-enUS;Previous]
$let[new-enUS;New]

$let[old;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_about];<user.name>;$username[$authorID]];<user.id>;$authorID];<user.tag>;$userTag[$authorID]];<var.purplets>;$getGlobalUserVar[user_bank;$authorID]];<user.status>;$replaceText[$replaceText[$getCustomStatus[$authorID;emoji];none;] $getCustomStatus[$authorID;state]; none;None]]]

$onlyIf[$checkContains[${bad.blockedWords};$message]!=true;{execute:noBadWords}]
$onlyIf[$charCount[$get[new]]<120;{execute:tooLong}]

$let[new;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;<user.name>;$username[$authorID]];<user.id>;$authorID];<user.tag>;$userTag[$authorID]];<var.purplets>;$getGlobalUserVar[user_bank;$authorID]];<user.status>;$replaceText[$replaceText[$getCustomStatus[$authorID;emoji];none;] $getCustomStatus[$authorID;state]; none;None]]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}