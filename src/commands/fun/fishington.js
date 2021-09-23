const {emojis, colors} = require("../../../index");

module.exports.command = {
    name: "fishington",
    module: "fun",
    aliases: ["fishingtonio", "playfishington", "playfish", "fish"],
    description_enUS: "Starts a Fishington.io activity within a voice channel.",
    botPerms: "createinvite",
    code: `
$apiMessage[$channelID;;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.success}}
;{actionRow:Join Activity,2,5,$replaceText[$getObjectProperty[invite];:;#COLON#]}
;$messageID:false;no]

$let[title-enUS;${emojis.success} You're all set!]
$let[description-enUS;Click on the button below to join the Fishington.io activity.]

$djsEval[
const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client);
client.discordTogether.createTogetherCode('$voiceID', 'fish').then(async invite => {
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