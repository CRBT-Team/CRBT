module.exports.joinCommand = {
    channel: "$channelID",
    code: `
$if[$roleExists[718944495105867898]==true]
$giveRole[$authorID;718944495105867898]
$else
$sendDM[$ownerID[660278400925171722];
woops uh the goblin role is gone ask clembs to tell me what's the new role]
$endif
$onlyForServerIDs[660278400925171722;]
    `}