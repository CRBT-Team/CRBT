const {colors} = require("../../index");

module.exports.command = {
  name: "$alwaysExecute",
  module: "autoPublish",
  code: `
$messagePublish

$onlyIf[$checkContains[$getServerVar[autoPublishedChannels];$channelID]==true;]
$onlyIf[$isBot[$authorID]==false;]
$onlyIf[$userExists[$authorID]==true;]
$onlyIf[$getServerVar[module_autoPublish]==true;]
$onlyIf[$channelType[$channelID]==news;]
  `}