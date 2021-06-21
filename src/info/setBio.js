const { colors } = require("../../index")

module.exports.command = {
  name: "setbio",
  aliases: ["set_bio", "bio_set"],
  code: `
  $setGlobalUserVar[profile_about;$message]
  `
}