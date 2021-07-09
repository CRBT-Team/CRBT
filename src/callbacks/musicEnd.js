const { colors, emojis } = require("../../index")

module.exports.musicEndCommand = {
  channel: "$channelID",
  code: `
$setServerVar[skip_votes;$getVar[skip_votes]]
$setServerVar[skip_users;$getVar[skip_users]]
$setServerVar[music_channel;$getVar[music_channel]]
$title[${emojis.music.stop} Inactivity notice]
$description[No music was added to the queue recently so $username[$clientID] left the voice channel.]
$color[${colors.error}]
`}