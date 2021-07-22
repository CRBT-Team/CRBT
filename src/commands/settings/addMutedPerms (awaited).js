module.exports.awaitedCommand = {
    name: "addMutedPerms",
    code: `
$modifyChannelPerms[$channelID;-sendmessages;-addreactions;-speak;-stream;$getServerVar[muted_role]]

$onlyIf[$roleExists[$getServerVar[muted_role]]==true]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;manageroles]==true;]
    `}