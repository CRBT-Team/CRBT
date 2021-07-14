const { colors } = require("../../../index");
const { emojis } = require("../../../index");

module.exports.command = {
    name: "unban",
    module: "moderation",
    description_enUS: "Unbans a user that was banned before.",
    usage_enUS: "<user ID | @mention>",
    userPerms: "ban",
    botPerms: "ban",
    code: `
$reply[$messageID;
{title:${emojis.general.sucess} Successfully unbanned $username[$message[1]].} 
{color:${colors.green}}
;no]
$setUserVar[strikelog;$getUserVar[strikelog;$message[1]], **(UNBAN)** $formatDate[$dateStamp;YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;MM]]==1];true;0$formatDate[$dateStamp;MM]];false;$formatDate[$dateStamp;MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;DD]]==1];true;0$formatDate[$dateStamp;DD]];false;$formatDate[$dateStamp;DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;HH]]==1];true;0$formatDate[$dateStamp;HH]];false;$formatDate[$dateStamp;HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;mm]]==1];true;0$formatDate[$dateStamp;mm]];false;$formatDate[$dateStamp;mm]] (GMT);$message[1]]
$unban[$message[1]]
$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];None;$channelID];
{author:Ban - $userTag[$message[1]]:$userAvatar[$message[1]]}
{field:User:
<@$message[1]>
:yes}
{field:Moderator:
<@$authorID>
:yes}
{field:Strike count:
$replaceText[$getUserVar[strike_count;$message[1]] strikes;1 strikes;1 strike]
:yes}
{color:${colors.red}}
]
$cooldown[$commandInfo[$commandName;cooldown];{title:${emojis.general.error} $getVar[error_cooldown]} {color:${colors.red}}]

$onlyIf[$message[1]!=$authorID;{title:${emojis.general.error} You can't unban yourself!} {footer:(wait what?)} {color:${colors.red}}]

$onlyIf[$message[1]!=;{execute:error_incorrectargs}]

$onlyIf[$rolePosition[$highestRole[$message[1]]]!=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't unban someone that's as high as you in the role hierachy!} {color:${colors.red}}]

$onlyIf[$rolePosition[$highestRole[$message[1]]]>=$rolePosition[$highestRole[$clientID]];{title:${emojis.general.error} I can't unban someone higher than me in the role hierachy!} {color:${colors.red}}]

$onlyIf[$rolePosition[$highestRole[$message[1]]]>=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't unban someone higher than you in the role hierachy!} {color:${colors.red}}]

$onlyIf[$isBanned[$message[1]]==true;{title:${emojis.general.error} This user isn't banned from this server.} {color:${colors.red}}]

$onlyPerms[ban;{title:${emojis.general.error} You need to be able to ban users first!} {color:${colors.red}}]

$onlyBotPerms[ban;{title:${emojis.general.error} I need the permission to ban users first!} {color:${colors.red}}]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}