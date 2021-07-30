module.exports.command = {
    name: "dbdts",
    module: "admin",
    description_enUS: "Gives dbd.ts' documentation on a given function (case sensitive).",
    usage_enUS: "<dbd.ts function>",
    examples_enUS: [
        "dbdts $sendReply",
        "dbdts $if"
    ],
    code: `
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}