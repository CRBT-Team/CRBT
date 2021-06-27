module.exports.deletedCommand = {
	channel: '$channelID',
	code: `$setChannelVar[snipeMsg;$message]
$setChannelVar[snipeAuthor;$authorID]
$setChannelVar[snipeChannel;$channelID]
$setChannelVar[snipeDate;$day.$month.$year - $hour:$minute]`
};