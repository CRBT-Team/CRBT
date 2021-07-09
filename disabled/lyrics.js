const { tokens } = require("../index");

module.exports.command = {
    name: "lyrics",
    code: `
$reply[$messageID;
{author:$get[title] - Lyrics}
{description:
**[Open in Genius]($get[link])**
$replaceText[$replaceText[$checkCondition[$charCount[$getObjectProperty[lyrics]]>3900];true;$cropText[$getObjectProperty[lyrics];2000]...];false;$getObjectProperty[lyrics]]}
{thumbnail:$get[thumb]}
;no]

$let[count;$charCount[**[Open in Genius]($get[link])**]]

$onlyIf[$getObjectProperty[lyrics]!=;no]

$addObjectProperty[lyrics;$jsonRequest[https://api.falsisdev.ga/lyrics?title=$message;lyrics]]

$let[thumb;$getObjectProperty[response.hits[0].result.header_image_url]]
$let[link;https://genius.com/songs/$getObjectProperty[response.hits[0].result.id]]
$let[title;$getObjectProperty[response.hits[0].result.full_title]]

$createObject[$httpRequest[https://api.genius.com/search?q=$uri[encode;$message];GET;;;lol error;Authorization:Bearer ${tokens.genius}]]
    `}
// $math[4000-$get[count]-4]