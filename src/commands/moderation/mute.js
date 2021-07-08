const { colors } = require("../../../index");
const { emojis } = require("../../../index");

module.exports.command = {
    name: "mute",
    module: "moderation",
    description: "Adds a muted role to the user and voice-mutes them with a reason (if specified).",
    usage_enUS: "<@mention> <reason (optional)>",
    aliases: ['ftg'],
    cooldown: "5s",
    code: `
$reply[$messageID;
{title:${emojis.general.sucess} Successfully muted $username[$mentioned[1]].} 
{color:${colors.green}}
;no]
$setUserVar[strike_count;$sum[$getUserVar[strike_count;$mentioned[1]];1];$mentioned[1]]
$setUserVar[strikelog;$getUserVar[strikelog;$mentioned[1]], **(MUTE)** $replaceText[$replaceText[$checkCondition[$noMentionMessage==];true;*No reason specified*];false;$noMentionMessage] - $formatDate[$dateStamp;YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;MM]]==1];true;0$formatDate[$dateStamp;MM]];false;$formatDate[$dateStamp;MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;DD]]==1];true;0$formatDate[$dateStamp;DD]];false;$formatDate[$dateStamp;DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;HH]]==1];true;0$formatDate[$dateStamp;HH]];false;$formatDate[$dateStamp;HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;mm]]==1];true;0$formatDate[$dateStamp;mm]];false;$formatDate[$dateStamp;mm]] (GMT);$mentioned[1]]
$giveRole[$mentioned[1];$getServerVar[muted_role]]
$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];None;$channelID];
{author:Mute - $userTag[$mentioned[1]]:$userAvatar[$mentioned[1]]}
{field:User:
<@$mentioned[1]>
:yes}
{field:Moderator:
<@$authorID>
:yes}
{field:Strike count:
$replaceText[$sum[$getUserVar[strike_count;$mentioned[1]];1] strikes;1 strikes;1 strike]
:yes}
{field:Reason:
$replaceText[$replaceText[$checkCondition[$noMentionMessage==];true;*No reason specified*];false;$noMentionMessage]
:no}
{color:${colors.red}}
]
$if[$voiceID[$mentioned[1]]!=]
$muteUser[$mentioned[1];yes;$replaceText[$replaceText[$checkCondition[$noMentionMessage==];true;*No reason specified*];false;$noMentionMessage]]
$onlyPerms[mutemembers;{title:${emojis.general.error} You need to be able to mute users first!} {color:${colors.red}}]
$onlyBotPerms[mutemembers;{title:${emojis.general.error} I need the permission to mute users first!} {color:${colors.red}}]
$else
$endif
$cooldown[$commandInfo[$commandName;cooldown];{title:${emojis.general.error} $getVar[error_cooldown]} {color:${colors.red}}]
$onlyIf[$hasRole[$mentioned[1];$getServerVar[muted_role]]==false;{title:${emojis.general.error} This user is already muted!} {color:${colors.red}}]
$onlyIf[$getServerVar[muted_role]!=None;{title:${emojis.general.error} No muted role was set!} {description:Use \`$getServerVar[prefix]$commandInfo[mutedrole;name] $commandInfo[mutedrole;usage]\` to change it.} {color:${colors.red}}]
$onlyIf[$mentioned[1]!=$authorID;{title:${emojis.general.error} You can't mute yourself!} {footer:(I mean technically you could but why would you?)} {color:${colors.red}}]
$onlyIf[$mentioned[1]!=$ownerID;{title:${emojis.general.error} You can't mute the server's owner!} {color:${colors.red}}]
$onlyIf[$mentioned[1]!=;{execute:error_incorrectargs}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]!=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't mute someone that's as high as you in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]>=$rolePosition[$highestRole[$clientID]];{title:${emojis.general.error} I can't mute someone higher than me in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]>=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't mute someone higher than you in the role hierachy!} {color:${colors.red}}]
$onlyBotPerms[manageroles;{title:${emojis.general.error} I need the permission to give/manage roles.} {color:${colors.red}}]
$onlyPerms[manageroles;{title:${emojis.general.error} You need the permission to give/manage roles.} {color:${colors.red}}]
$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}