const { colors, emojis } = require("../../index")

module.exports.musicEndCommand = {
  channel: "$channelID",
  code: `
$title[${emojis.music.stop} Inactivity notice]
$description[No music was added to the queue recently so $username[$clientID] left the voice channel.]
$color[${colors.red}]
`}