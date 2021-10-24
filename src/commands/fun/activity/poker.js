const {emojis, colors} = require("../../../..");

module.exports.command = {
    name: "poker",
    module: "fun",
    aliases: ["pokernight", "playpoker"],
    description_enUS: "Starts a Poker Night activity within a voice channel.",
    botPerms: "createinvite",
    code: `
$apiMessage[$channelID;;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]
$if[$getGlobalUserVar[activity_notice]==false]
$get[notice]
$setGlobalUserVar[activity_notice;true]
$endif
}
{color:${colors.success}}
;{actionRow:Join Activity,2,5,$replaceText[$getObjectProperty[invite];:;#COLON#]}
;$messageID:false;no]

$let[title-enUS;${emojis.success} You're all set!]
$let[description-enUS;Click on the button below to join the **$get[activity]** activity.]

$let[notice;
**⚠ Some things to be aware of**:

• Activities are not available on mobile yet.
• They're in **BETA** and developed by Discord, so you shouldn't report any errors you may find to the CRBT devs.
• At least one person must have their Activity Status enabled.
(<:settings:585767366743293952> User Settings > "Activity Status" > "Display current activity as status message" ${emojis.toggle.on})
• People who join the activity will not show as "Playing $get[activity]" unless they have their Activity Status enabled.
]

$let[activity;Poker Night]

$djsEval[
const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client);
client.discordTogether.createTogetherCode('$voiceID', 'poker').then(async invite => {
d.object.invite = invite.code;
});]

$onlyIf[$hasPermsInChannel[$voiceID;$clientID;createinvite]==true;{execute:botPerms}]
$onlyIf[$voiceID!=;{execute:novoice}]
$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
`}