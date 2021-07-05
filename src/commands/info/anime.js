module.exports.command = {
    name: "anime",
    aliases: ['searchanime','animesearch'],
    description_enUS: "Searches your query on kitsu.io, and returns a corresponding anime",
    usage_enUS: "<anime name (e.g. Konosuba, Attack on Titan)",
    module: "info",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.clembs.xyz/C6PFAcn.png}

{description:
**[$get[openIn-$getGlobalUserVar[language]]](https://kitsu.io/anime/$getObjectProperty[id])** $replaceText[$replaceText[$checkCondition[$getObjectProperty[youtubeVideoId]==];true;];false;| **[Open YouTube trailer](https://youtu.be/$getObjectProperty[youtubeVideoId])**]
}

{field:Synopsis:
$cropText[$replaceText[$getObjectProperty[synopsis];#SEMI#;#SEMI#];300]...
:no}

{field:Episodes:
$getObjectProperty[episodeCount] ($getObjectProperty[episodeLength] minutes $replaceText[$replaceText[$checkCondition[$getObjectProperty[episodeCount]==1];true;long];false;each])
:yes}

{field:Type:
$replaceText[$replaceText[$replaceText[$toLocaleUppercase[$getObjectProperty[showType]];Tv;TV];Ova;OVA];Ona;ONA]
:yes}

{field:Rated:
$getObjectProperty[ageRating]
$getObjectProperty[ageRatingGuide]
:yes}

{field:Score:
$getObjectProperty[averageRating]/100 
Top $getObjectProperty[ratingRank] on **[kitsu.io](https://kitsu.io)**
:yes}

{field:Aired:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[endDate]==];true;Since <t:$formatDate[$getObjectProperty[startDate];X]:D>];false;From <t:$formatDate[$getObjectProperty[startDate];X]:D> to <t:$formatDate[$getObjectProperty[endDate];X]:D>]
:yes}

{thumbnail:$getObjectProperty[posterImage.medium]}

{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$replaceText[$getObjectProperty[titles.canonical];:;#COLON#] - Anime info]
$let[openIn-enUS;Open in kitsu.io]


$createObject[$jsonRequest[https://api.f1r3.tk/anime?name=$replaceText[$message; ;+]]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}