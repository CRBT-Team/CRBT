module.exports.command = {
    name: "dave",
    code: `
$sendDM[$authorID;
https://davecode.me]

$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyForIDs[$botOwnerID;244905301059436545;]
    `}