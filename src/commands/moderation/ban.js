const { colors } = require("../../../index");
const { emojis } = require("../../../index");

module.exports.command = {
    name: "ban",
    module: "moderation",
    description: "Bans the user with a reason if specified.",
    usage_enUS: "<@mention> <reason (optional)>",
    aliases: ['yeet','permaban'],
    cooldown: "5s",
    code: `
$reply[$messageID;
{title:${emojis.general.sucess} Successfully banned $username[$mentioned[1]].} 
{color:${colors.green}}
;no]
$ban[$mentioned[1];$replaceText[$replaceText[$checkCondition[$noMentionMessage==];true;*No reason specified*];false;$noMentionMessage];0]
$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];None;$channelID];
{author:Ban - $userTag[$mentioned[1]]:$userAvatar[$mentioned[1]]}
{field:User:
<@$mentioned[1]>
:yes}
{field:Moderator:
<@$authorID>
:yes}
{field:Reason:
$replaceText[$replaceText[$checkCondition[$noMentionMessage==];true;*No reason specified*];false;$noMentionMessage]
:no}
{color:${colors.red}}
]
$cooldown[$commandInfo[$commandName;cooldown];{title:${emojis.general.error} $getVar[error_cooldown]} {color:${colors.red}}]
$onlyIf[$mentioned[1]!=$authorID;{title:${emojis.general.error} You can't ban yourself!} {footer:(I mean technically you could but why would you?)} {color:${colors.red}}]
$onlyIf[$mentioned[1]!=$ownerID;{title:${emojis.general.error} You can't ban the server's owner!} {color:${colors.red}}]
$onlyIf[$mentioned[1]!=;{execute:error_nomention}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]!=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't ban someone that's as high as you in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]>=$rolePosition[$highestRole[$clientID]];{title:${emojis.general.error} I can't ban someone higher than me in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]>=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't ban someone higher than you in the role hierachy!} {color:${colors.red}}]
$onlyPerms[ban;{title:${emojis.general.error} You need to be able to ban users first!} {color:${colors.red}}]
$onlyBotPerms[ban;{title:${emojis.general.error} I need the permission to ban users first!} {color:${colors.red}}]
$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}


    // add a field that tells the user the strike counts because i removed it since there is
    // no variable that is called "strike_count"