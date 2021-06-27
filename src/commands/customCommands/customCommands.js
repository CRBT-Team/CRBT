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

$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[

$getServerVar[cmd1code]

;<profile.name>;$getGlobalUserVar[profile_name]]
;<profile.banner>;$get[profileBanner]]
;<profile.badges>;$get[profileBadges]]
;<profile.badges.count>;$math[$replaceText[$replaceText[$checkContains[$getGlobalUserVar[profile_badges];badge];false;0];true;$charCount[$replaceText[$replaceText[$findSpecialChars[$getGlobalUserVar[profile_badges]]; ;];>;]]]/12]]
;<profile.bio>;$getGlobalUserVar[profile_about]]
;<profile.pronouns>;$replaceText[$toLocaleUppercase[$getGlobalUserVar[profilePronouns]]; ;/]]

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
;<var.sexes>;$getGlobalUserVar[sexLogs]]
;<var.language>;$getGlobalUserVar[language]]
;<var.telemetry>;$getGlobalUserVar[telemetry]]

;<user.message>;$messageSlice[1]]
;<user.message.uppercase>;$toUppercase[$messageSlice[1]]]
;<user.message.lowercase>;$toLowercase[$messageSlice[1]]]

;<rng.10>;$random[0;10]]
;<rng.50>;$random[0;50]]
;<rng.1000>;$random[0;1000]]
;<rng.500>;$random[0;500]]
;<rng>;$random[-9999999999;9999999999]]
;<rng.100>;$random[0;100]]
;<rng.chars>;$randomString[10]]
;<rng.user>;$randomUserID]
;<rng.user.id>;$randomUserID]
;<rng.user.tag>;$userTag[$randomUserID]]
;<rng.user.name>;$userName[$randomUserID]]

;<bot.ping>;$ping]
;<bot.aoi>;$packageVersion]
;<bot.uptime>;$uptime]
;<bot.perms>;$userPerms[$clientID]]
;<bot.id>;$clientID]
;<bot.prefix>;$getServerVar[prefix]]
;<bot.version>;${botinfo.version}]

;<server.name>;$serverName]
;<server.id>;$guildID]
;<server.channels>;$channelCount]
;<server.owner>;$ownerID]
;<server.emojis>;$emojiCount]
;<server.roles>;($roleCount) $replaceText[$guildRoles[mention];>,;>] <@&$guildID>]
;<server.boosts>;$serverBoostCount]
;<server.members>;$membersCount]
;<server.members.humans>;$sub[$membersCount;$botCount]]

;<channel.id>;$channelID]
;<message.id>;$messageID]
;<category.id>;$channelCategoryID]
}
;no]

$textSplit[/]

$endif

$let[profileBadges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_badges];<badge ;];>;];udu;${items.badges.udu.contents}];russian;${items.badges.russia.contents}];french;${items.badges.france.contents}];usa;${items.badges.usa.contents}];brazil;${items.badges.brazil.contents}];poland;${items.badges.poland.contents}];goodmeal;${items.badges.goodmeal.contents}];dollidot;${items.badges.dollidot.contents}];developer;${items.badges.developer.contents}];partner;${items.badges.partner.contents}];purplet;${items.badges.purplet.contents}];dave;${items.badges.dave.contents}];doctor;${items.badges.doctor.contents}];musician;${items.badges.musician.contents}];illustrator;${items.badges.illustrator.contents}];flushed;${items.badges.flushed.contents}];joy;${items.badges.joy.contents}];smile;${items.badges.smile.contents}];thinking;${items.badges.thinking.contents}];winktongue;${items.badges.winktongue.contents}];starstruck;${items.badges.starstruck.contents}];pensive;${items.badges.pensive.contents}];wink;${items.badges.wink.contents}]]
$let[profileBanner;${links.banners}$getObjectProperty[banners.$get[a].season]/$getObjectProperty[banners.$get[a].contents]]
$djsEval[const { items, links } = require("../../../../../index");
d.object.banners = items.banners;]
$let[a;$replaceText[$replaceText[$getGlobalUserVar[profile_banner];<banner ;];>;]]

$onlyIf[$isBot[$authorID]==false;]
$onlyIf[$userExists[$authorID]==true;]
    `}