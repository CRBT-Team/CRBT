module.exports.command = {
    name: "eval",
    aliases: ["e"],
    code: `
$addCmdReactions[🏳️]
$eval[$message]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}