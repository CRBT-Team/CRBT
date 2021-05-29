const colors = require('./json/colors.json');
const emojis = require('./json/emojis.json');
const items = require('./json/items.json');
const jobs = require('./json/jobs.json');
const links = require('./json/links.json');
const tokens = require('./json/tokens.json');
const botinfo = require('./package.json');

module.exports.command = {
  name: "play",
  module: "music",
  aliases: ["play"],
  description_enUS: "Adds <botname> to the voice channel, adds the song(s) to the queue or directly plays it if no music is currently playing.",
  usage_enUS: "<search keywords or YouTube, Spotify or SoundCloud URL>",
  botperms: [""],
  code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;Processing...]
$let[step1-enUS;Joined <#$voiceID> and bound to <#$channelID>]
$let[step2-enUS;Searching for \`$message\`...]
$let[list-enUS;Fetching playlist]
$let[step3-enUS;Currently playing]
$let[added-enUS;Added by]
$let[volume-enUS;Volume:]
$let[uploaded-enUS;Uploaded by]

$argsCheck[0;{execute:args}]

$setGlobalUserVar[last_cmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}