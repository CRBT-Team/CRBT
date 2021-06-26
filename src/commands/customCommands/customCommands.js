const { colors, emojis, links, tokens, botinfo, illustrations, logos, items, jobs, api } = require("../../../index");

module.exports.command = {
    name: "$alwaysExecute",
    module: "customCommands",
    code: `
$if[$toLowercase[$message[1]]==$toLowercase[$getServerVar[prefix]$getServerVar[cmd1title]]]

$reply[$messageID;
{description:
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[


$getServerVar[cmd1code]

;<user.name>;$username]
;<user.mention>;<@$authorID>]
;<user.avatar>;$authorAvatar]
;<user.id>;$authorID]
;<user.perms>;$filterMessageWords[$replaceText[$replaceText[$replaceText[$hasPerms[$authorID;admin];false;$userPerms[$authorID]];true;Administrator (all permissions)];Tts;TTS];no;Add Reactions, ;View Channel, ;Send Messages, ;Use Vad, ;Read Message History, ;Embed Links, ;Connect, ;Speak, ;Use External Emojis, ;Stream, ]]
;<user.nick>;$nickname]
;<user.status>;$replaceText[$replaceText[$activity[$authorID];Custom Status;Custom Status: $replaceText[$getCustomStatus[$authorID;emoji] ;none ;]$replaceText[$getCustomStatus[$authorID];none;]\n];none;*None*]]
;<user.tag>;$userTag]
;<user.discrim>;$discriminator]
;<user.creation>;$replaceText[$creationDate[$findUser[$message];date];GMT+0000 (Coordinated Universal Time);(GMT)]]

;<time.day>;$day]
;<time.month>;$month]
;<time.year>;$year]
;<time.time>;$hour:$minute:$second]
;<time.date>;$month/$day/$year]
;<time.stamp>;$dateStamp]

;<var.purplets>;$getGlobalUserVar[user_bank]]

;<profile.name>;$getGlobalUserVar[profile_name]]
;<profile.banner>;$getGlobalUserVar[profile_banner]]
;<profile.badges>;$getGlobalUserVar[profile_badges]]
;<profile.bio>;$getGlobalUserVar[profile_about]]

;<user.message>;$messageSlice[1]]
;<user.message.shout>;$toUppercase[$messageSlice[1]]]
;<user.message.shush>;$toLowercase[$messageSlice[1]]]

;<rng.10>;$random[0;10]]
;<rng.50>;$random[0;50]]
;<rng.1000>;$random[0;1000]]
;<rng.500>;$random[0;500]]
;<rng>;$random[-9999999999;9999999999]]
;<rng.100>;$random[0;100]]
;<rng.chars>;$randomString[10]]
;<rng.user>;$userTag[$randomUserID] ($randomUserID)]

;<énorme>;<:enorme:738807762988957786>]

;<bot.ping>;$ping]
;<bot.aoi>;$packageVersion]
;<bot.uptime>;$uptime]
;<bot.perms>;$userPerms[$clientID]]
;<bot.id>;$clientID]
;<prefix>;$getServerVar[prefix]]
;<bot.version>;${botinfo.version}]

;<media>;https://clembs.xyz/media/]

;<server.name>;$serverName]
;<server.id>;$guildID]
;<server.channels>;$channelCount]
;<server.owner>;$ownerID]
;<server.emojis>;$emojiCount]
;<server.roles>;($roleCount) $replaceText[$guildRoles[mention];>,;>] <@&$guildID>]
;<server.boosts>;$serverBoostCount]
;<server.members>;$membersCount]
;<server.members.humans>;$sub[$membersCount;$botCount]]

;<channelid>;$channelID]
;<messageid>;$messageID]
;<categoryid>;$channelCategoryID]
}
;no]

$endif

$onlyIf[$isBot[$authorID]==false;]
    `}