const { links, misc } = require("../../../index"); 

module.exports.command = {
    name: "invite",
    aliases: ["crbtinvite", "discord"],
    module: "general",
    description_enUS: "Gives useful links to invite CRBT or to join the Discord community.",
    slashCmd: 'crbt type:invite',
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[${misc.CRBTid};64]}
{description:
$get[recommendedPerms-$getGlobalUserVar[language]]

$get[noPerms-$getGlobalUserVar[language]]

$get[discord-$getGlobalUserVar[language]]
}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$username[${misc.CRBTid}] - Invite]
$let[recommendedPerms-enUS;**[Invite CRBT with administrator permissions](${links.invite.fullInvite})** (recommended)
Get all of CRBT's features working perfectly, with no permissions issues]
$let[noPerms-enUS;**[Invite CRBT with no permissions](${links.invite.minPerms})**
Restrict CRBT's features (useful if you have a "Bots" role with set permissions)]
$let[discord-enUS;**[Join the Discord community](${links.discord})**
Get support, try new features and engage with the other members!]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}