const {colors} = require("../../../index");

module.exports.command = {
    name: "mutedrole",
    code: `
role set to <@&$getServerVar[muted_role]>

$forEachGuildChannel[addMutedPerms]

$setServerVar[muted_role;$findRole[Muted]]

$createRole[Muted;${colors.red};no;yes]
    `}