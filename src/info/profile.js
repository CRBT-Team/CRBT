module.exports.command = {
  name: "profile",
  code: `
  $reply[$messageID;
    {title:$username[$authorID]s profile}
    {description:$getUserVar[profile_about]}
  ;no]
  `
}