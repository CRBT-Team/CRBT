module.exports.awaitedCommand = {
    name: "addMutedPerms",
    code: `
$modifyChannelPerms[$channelID;-sendmessages;-addreactions;-speak;-stream;$getServerVar[muted_role]]

$onlyIf[$hasPermsInChannel[$channelID;$clientID;manageroles]==true;]
    `}