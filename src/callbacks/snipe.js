module.exports.deletedCommand = {
	channel: '$channelID',
	code: `
$setChannelVar[snipeContent;$message]
$setChannelVar[snipeAuthor;$authorID]
$setChannelVar[snipeChannel;$channelID]
$setChannelVar[snipeStamp;$dateStamp]
	`}