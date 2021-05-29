module.exports.command = {
    name: "gameinfo",
    code: `
$reply[$messageID;
{title:$getObjectProperty[name]}
{url:https://store.steampowered.com/app/$getObjectProperty[appid]}
{field:Developer:
$getObjectProperty[developer]
:yes}
{field:Publisher:
$getObjectProperty[publisher]
:yes}
{field:Ratings:
:+1: $getObjectProperty[positive]
:-1: $getObjectProperty[negative]
:yes}
{field:Price:
$getObjectProperty[price]
:yes}
{field:Languages:
$getObjectProperty[languages]
:yes}
;no]

$createObject[$jsonRequest[https://steamspy.com/api.php?request=appdetails&appid=$getObjectProperty[appid]]]
$djsEval[var appid = require("appid")
async function help() { 
try {
    let game = await appid("$getObjectProperty[msg]")
    d.object.appid = game.appid
} catch (e) {
console.error(e)
}
}
help()]
$createObject[{"msg":"$message"}]
    `}