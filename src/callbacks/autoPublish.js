module.exports.command = {
  name: "$alwaysExecute",
  module: "autoPublish",
  code: `
$messagePublish

$onlyBotPerms[managemessages;{author:I need the "Manage messages" permission to publish this message} {color:$getVar[yellow]}]
$onlyBotPerms[manageserver;{author:I need the "Manage server" permission to publish this message} {color:$getVar[yellow]}]
$onlyIf[$checkContains[$getServerVar[autopublishedchannels];$channelID]==true;]
$onlyIf[$isBot[$authorID]==false;]
$onlyIf[$userExists[$authorID]==false;]
$onlyIf[$getServerVar[module_autoPublish]==true;]
$onlyIf[$channelType[$channelID]==news;]
  `}