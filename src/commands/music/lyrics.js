const { tokens } = require("../../../index");

module.exports.command = {
    name: "lyrics",
    code: `
$reply[$messageID;
{author:$getObjectProperty[response.hits[0].result.full_title] - Lyrics}
{description:$getObjectProperty[lyrics]}
{thumbnail:$getObjectProperty[response.hits[0].result.header_image_url]}
;no]

$djsEval[async function shutup(text) {
const Genius = require("genius-lyrics");
const Client = new Genius.Client("${tokens.genius}");
const searches = await Client.songs.search(text);
d.object.lyrics = await searches[0].lyrics();
}
shutup("$get[request]")]

$createObject[$httpRequest[https://api.genius.com/search?q=$uri[encode;$get[request]];GET;;;lol error;Authorization:Bearer ${tokens.genius}]]

$let[request;$replaceText[$message;";]]
    `}