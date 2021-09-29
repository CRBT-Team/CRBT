const {colors, emojis} = require("../../../index");

module.exports.command = {
    name: "mutedrole",
    aliases: ["addmutedrole", "add_mutedrole", "add-mutedrole", "set_mutedrole","muterole","set_muterole","set-muterole"],
    description_enUS: "Creates a role with restricted speech permissions or sets an existing role to being given upon using the <prefix>mute command.",
    usage_enUS: "<role ID | role name | @role (optional)>",
    module: "settings",
    examples_enUS: [
        "addmutedrole",
        "setmuted @Muted",
        "mutedrole Muted"
    ],
    botPerms: ["managechannels", "manageroles"],
    userPerms: ["manageserver", "manageroles"],
    code: `
$if[$message==]

    $forEachGuildChannel[addMutedPerms]
    $wait[250ms]

$reply[$messageID;
{title:${emojis.success} Muted role created}
{description:
$username[$clientID] edited all channels it can access to restrict talk/voice/reactions/video permissions for this role. 
This role will now be given upon using the \`$getServerVar[prefix]mute\` command.
}
{field:Previous:
$replaceText[$replaceText[$checkCondition[$getServerVar[muted_role]==$getVar[muted_role]];true;None];false;<@&$getServerVar[muted_role]>]
:yes}
{field:New:
<@&$getServerVar[muted_role]> ($getServerVar[muted_role]) 
:yes}
{color:${colors.success}}
;no]
$wait[$math[$dbPing*3]ms]

$setServerVar[muted_role;$findRole[Muted]]

$wait[300ms]

$createRole[Muted;${colors.red};no;yes]

$onlyIf[$roleCount!=250;{execute:limitReached}]

$onlyBotPerms[managechannels;manageroles;{execute:botPerms}]

$else

$setServerVar[muted_role;$get[role]]

$reply[$messageID;
{title:${emojis.success} Muted role changed}
{description:
This role will now be given upon using the \`$getServerVar[prefix]mute\` command.
}
{field:Previous:
$replaceText[$replaceText[$checkCondition[$getServerVar[muted_role]==];true;None];false;<@&$getServerVar[muted_role]>]
:yes}
{field:New:
<@&$get[role]>
:yes}
{color:${colors.success}}
;no]

$onlyIf[$get[role]!=;{execute:roleNotFound}]
$let[role;$findRole[$message]]

$endif

$onlyPerms[manageserver;manageroles;{execute:userPerms}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}