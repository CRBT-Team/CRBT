module.exports.command = {
    name: "json",
    aliases: ["get", "request", "jsonrequest"],
    module: "admin",
    code: `
$addCmdReactions[🏳️]
$if[$argsCount==1]
$createFile[$jsonRequest[$message[1];;error message xd];request.json]
$elseIf[$argsCount==2]
\`\`\`
$jsonRequest[$message[1];$message[2];error message xd]
\`\`\`
$endelseIf
$endif
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}