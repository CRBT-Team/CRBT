module.exports.command = {
  name: "yt",
  module: "misc",
  aliases: ["youtube", "yttogether", "w2g"],
  description_enUS: "description.",
  usage_enUS: "\"nothing lol rekt\"",
  botperms: ["perm1", "perm2"],
  code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;hi]
$let[description-enUS;[click here to join the youtube together in your VC]($getObjectProperty[invite])]

$djsEval[
const discordTogether = require('discord-together');
client.discordTogether.createTogetherCode('$voiceID', 'youtube').then(async invite => {
  d.object.invite = invite.code;
});]

$createObject[{}]

$onlyIf[$voiceID!=;bitch connect to a voice channel first smh]

$argsCheck[0;{execute:args}]

$setGlobalUserVar[last_cmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}