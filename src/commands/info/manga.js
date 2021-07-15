const {tokens} = require("../../../index");

module.exports.command = {
    name: "manga",
    aliases: ['searchmanga','mangasearch'],
    description_enUS: "Searches your query on kitsu.io, and returns a corresponding manga.",
    usage_enUS: "<manga name (e.g. Re:ZERO, Kanojo Okarishimasu)",
    module: "info",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.clembs.xyz/C6PFAcn.png}

{description:
**[$get[openIn-$getGlobalUserVar[language]]](https://kitsu.io/anime/$getObjectProperty[res.id])**
}

{field:Synopsis:
$cropText[$replaceText[$getObjectProperty[res.synopsis];#SEMI#;#SEMI#];300]...
:no}

{field:Volumes:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[res.volumeCount]==];true;0];false;$getObjectProperty[res.volumeCount]]
:yes}

{field:Chapters:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[res.chapterCount]==];true;0];false;$getObjectProperty[res.chapterCount]]
:yes}

{field:Type:
$toLocaleUppercase[$getObjectProperty[res.mangaType]]
:yes}

{field:Rated:
$getObjectProperty[res.ageRating]
$getObjectProperty[res.ageRatingGuide]
:yes}

{field:Score:
$getObjectProperty[res.averageRating]/100 
Top $getObjectProperty[res.ratingRank] on **[kitsu.io](https://kitsu.io)**
:yes}

{field:Released:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[res.endDate]==];true;Since <t:$formatDate[$getObjectProperty[res.startDate];X]:D>];false;From <t:$formatDate[$getObjectProperty[res.startDate];X]:D> to <t:$formatDate[$getObjectProperty[res.endDate];X]:D>]
:yes}

{thumbnail:$getObjectProperty[res.posterImage.medium]}

{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$replaceText[$replaceText[$checkCondition[$getObjectProperty[res.titles.enJp]==];false;$replaceText[$getObjectProperty[res.titles.enJp];:;#COLON#]];true;$replaceText[$getObjectProperty[res.titles.en];:;#COLON#]] - Manga info]
$let[openIn-enUS;Open in kitsu.io]

$createFile[$getObject;source.json]

$onlyIf[$getObjectProperty[success]!=false;{execute:queryNotFound}]

$createObject[$replaceText[$jsonRequest[https://api.avux.ga/mangasearch?search=$message;;;X-API-Key:${tokens.avux}];{};{"success":"false"}]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}