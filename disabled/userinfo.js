const colors = require('./json/colors.json');
const emojis = require('./json/emojis.json');
const items = require('./json/items.json');
const jobs = require('./json/jobs.json');
const links = require('./json/links.json');
const tokens = require('./json/tokens.json');
const botinfo = require('./package.json');

module.exports.command = {
  name: "template",
  module: "info",
  aliases: ["templatealias"],
  description_enUS: "description.",
  usage_enUS: "<>",
  botperms: ["perm1", "perm2"],
  code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;hi]
$let[description-enUS;description]

$argsCheck[0;{execute:args}]

$setGlobalUserVar[last_cmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}