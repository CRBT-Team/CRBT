module.exports.command = {
    name: "eval",
    aliases: ["e"],
    module: "admin",
    code: `
$addCmdReactions[🏳️]
$eval[$message]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}