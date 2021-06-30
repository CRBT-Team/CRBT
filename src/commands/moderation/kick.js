const { colors } = require("../../../index");
const { emojis } = require("../../../index");

module.exports.command = {
    name: "kick",
    module: "moderation",
    description: "Kicks the user with a reason if specified.",
    usage_enUS: "<@mention> <reason (optional)>",
    aliases: ['expulse',"gtfo"],
    cooldown: "5s",
    code: `
$reply[$messageID;
{title:${emojis.general.sucess} Successfully kicked $username[$mentioned[1]].} 
{color:${colors.green}}
;no]
$kick[$mentioned[1]]
$channelSendMessage[$replaceText[$getServerVar[modlogsChannel];None;$channelID];
{author:Kick - $userTag[$mentioned[1]]:$userAvatar[$mentioned[1]]}
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
$cooldown[$commandInfo[$commandName;cooldown];{title:${emojis.general.error} $getVar[errorCooldown]} {color:${colors.red}}]
$onlyIf[$mentioned[1]!=$authorID;${emojis.general.error} You can't kick yourself!} {footer:(Just leave the server lol)} {color:${colors.red}}]
$onlyIf[$mentioned[1]!=$ownerID;{title:${emojis.general.error} You can't kick the server's owner!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]!=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't kick someone that's as high as you in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]>=$rolePosition[$highestRole[$clientID]];{title:${emojis.general.error} I can't kick someone higher than me in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$mentioned[1]]]>=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't kick someone higher than you in the role hierachy!} {color:${colors.red}}]
$onlyPerms[kick;{title:${emojis.general.error} You need to be able to kick users first!} {color:${colors.red}}]
$onlyBotPerms[kick;{title:${emojis.general.error} I need the permission to kick users first!} {color:${colors.red}}]
$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}


    // add a field that tells the user the strike counts because i removed it since there is
    // no variable that is called "strike_count"