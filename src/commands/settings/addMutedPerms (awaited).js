module.exports.awaitedCommand = {
    name: "addMutedPerms",
    code: `
$modifyChannelPerms[$channelID;-sendmessages;-addreactions;$getServerVar[muted_role]]

$onlyIf[$hasPermsInChannel[$channelID;$clientID;manageroles]==true;]
    `}