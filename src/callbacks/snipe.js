module.exports.deletedCommand = {
	channel: '$channelID',
	code: `
$setChannelVar[snipeContent;$message]
$setChannelVar[snipeDetails;$authorID//$channelID//$dateStamp]
$onlyIf[$channelType!=dm;]
$onlyIf[$getServerVar[module_messageLogs]==true;]
	`}