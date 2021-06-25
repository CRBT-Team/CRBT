const { emojis, colors } = require("../../index");
const bad = require("../../json/sad/badwords.json");

module.exports.command = {
    name: "setbio",
    aliases: ["bio", "set_about", "about", "set_description", "description", "set_bio", "setabout", "set-bio", "set-about", "set-description", "setdescription", "set_description"],
    module: "economy",
    usage_enUS: "<new bio (may include CRBTscript tags)>",
    description_enUS: "Changes your bio shown on your CRBT profile.",
    code: `
$setGlobalUserVar[profile_about;$message]

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

$let[title-enUS;${emojis.general.success} Profile bio changed]
$let[previous-enUS;Previous]
$let[new-enUS;New]

$let[old;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_about];<username>;$username[$authorID]];<userid>;$authorID];<usertag>;$userTag[$authorID]];<purplets>;$getGlobalUserVar[user_bank;$authorID]];<userstatus>;$replaceText[$replaceText[$getCustomStatus[$authorID;emoji];none;] $getCustomStatus[$authorID;state]; none;None]]]

$onlyIf[$checkContains[${bad.blockedWords};$message]!=true;{execute:noBadWords}]
$onlyIf[$charCount[$get[new]]<120;{execute:bioTooLong}]

$let[new;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;<username>;$username[$authorID]];<userid>;$authorID];<usertag>;$userTag[$authorID]];<purplets>;$getGlobalUserVar[user_bank;$authorID]];<userstatus>;$replaceText[$replaceText[$getCustomStatus[$authorID;emoji];none;] $getCustomStatus[$authorID;state]; none;None]]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}