const { illustrations } = require("../../../index");

module.exports.command = {
    name: "inviteinfo",
    aliases: ["ii", "invite-info", "invite_info"],
    module: "info",
    description_enUS: "",
    usage_enUS: "<invite code | url>",
    code: `
$eval[
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:${illustrations.invite}}
{title:$getObjectProperty[guild.name]}

{description:$getObjectProperty[guild.welcome_screen.description]}
{image:$get[banner2]}
{thumbnail:$get[icon2]}

$if[$getObjectProperty[guild.welcome_screen.description]!=]
{description:$replaceText[$replaceText[$get[isNSFW];false;$getObjectProperty[guild.welcome_screen.description]];true;||$getObjectProperty[guild.welcome_screen.description]||]}
$endif

{field:$get[landingChannel-$getGlobalUserVar[language]]:
<#$getObjectProperty[channel.id]>
:yes}

{field:$get[serverID-$getGlobalUserVar[language]]:
$getObjectProperty[guild.id]    
:yes}

{field:$get[inviter-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[inviter.id]!=];true;$userTag[$getObjectProperty[inviter.id]]
($getObjectProperty[inviter.id])];false;$get[vanity-$getGlobalUserVar[language]]]
:no}

{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$get[code] - Invite info]
$let[serverID-enUS;Server ID]
$let[landingChannel-enUS;Landing channel]
$let[inviter-enUS;Inviter]
$let[vanity-enUS;Vanity URL]

$let[banner2;$replaceText[$replaceText[$get[isNSFW];false;https://cdn.discordapp.com/banners/$getObjectProperty[guild.id]/$getObjectProperty[guild.banner].png?size=512];true;]]
$let[icon2;$replaceText[$replaceText[$get[isNSFW];false;https://cdn.discordapp.com/icons/$getObjectProperty[guild.id]/$getObjectProperty[guild.icon].png?size=512];true;https://cdn.discordapp.com/attachments/782584672772423684/855777630199480320/unknown.png]]

$let[isNSFW;$checkCondition[$getObjectProperty[guild.nsfw]==true]]

$onlyIf[$getObjectProperty[message]!=Unknown Invite;{execute:args}]

$createObject[$httpRequest[https://discord.com/api/v8/invites/$get[code];GET]]

$let[code;$replaceText[$replaceText[$replaceText[$message;https://discord.gg/;];https://discord.com/invite/;];discord.gg/;]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}