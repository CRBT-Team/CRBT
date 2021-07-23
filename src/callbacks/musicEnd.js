const { colors, emojis } = require("../../index")

module.exports.musicEndCommand = {
  channel: "$channelID",
  code: `
$deleteServerVar[music_channel]
`}

/*$setServerVar[skip_users;$getVar[skip_users]]
$setServerVar[skip_votes;$getVar[skip_votes]] */