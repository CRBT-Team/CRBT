const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "queryNotFound",
    code: `
$reply[$messageID;
{title:$get[$getGlobalUserVar[lastCmd]-1-$getGlobalUserVar[language]]} 
{description:$get[$getGlobalUserVar[lastCmd]-2-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[aoijs-1-enUS;${emojis.general.error} Couldn't find this Aoi.js function...]
$let[aoijs-2-enUS;...although you can still try to search through Aoi.js' documentation, right [here](https://aoi.leref.ga).]

$let[anime-1-enUS;${emojis.general.error} We couldn't get this one.]
$let[anime-2-enUS;Try to use the japanese name of the anime or check your spelling. If the problem still persists, try to look this anime up directly on [kitsu.io](https://kitsu.io/).]

$let[define-1-enUS;${emojis.general.error} This word doesn't appear to exist...]
$let[define-2-enUS;FYI: The Dictionary only accepts english words for now. If your word doesn't exist here, you can try to look it up with \`$getServerVar[prefix]urbandictionary\`.]

$let[emojiinfo-1-enUS;${emojis.general.error} Couldn't find this emoji 🤔.]
$let[emojiinfo-2-enUS;Check your spelling, if $username[$clientID] is in the server where the emoji is from, or if the emoji exists at all.]

$let[github-1-enUS;${emojis.general.error} 404 This is not the page you are looking for.]
$let[github-2-enUS;We couldn't find this GitHub user or repository.]

$let[inviteinfo-1-enUS;${emojis.general.error} Invalid invite!]
$let[inviteinfo-2-enUS;This invite expired, is invalid or the origin server was deleted...]

$let[manga-1-enUS;${emojis.general.error} We couldn't get this one.]
$let[manga-2-enUS;Try to use the japanese name of the manga or check your spelling. If the problem still persists, try to look this manga up directly on [kitsu.io](https://kitsu.io/).]

$let[mcinfo-1-enUS;${emojis.general.error} Couldn't find that player!]
$let[mcinfo-2-enUS;Make sure to include a valid Minecraft Java Edition player name, and not a UUID or Minecraft Bedrock player name.]

$let[mcserver-1-enUS;${emojis.general.error} Internal Exception: \`io.crbt.handler.timeout.unknownServer\`]
$let[mcserver-2-enUS;Couldn't find this Minecraft Java Edition server! Make sure to use a valid host address or that the server is online.]

$let[pokedex-1-enUS;${emojis.general.error} Who's that Pokémon?]
$let[pokedex-2-enUS;Couldn't find his Pokémon. Make sure to check your spelling or this beautiful [web Pokédex](https://www.pokemon.com/us/pokedex/) for all Pokémon.]

$let[urbandictionary-1-enUS;${emojis.general.error} Couldn't find this word...]
$let[urbandictionary-2-enUS;Nobody has defined this word on Urban Dictionary yet.]

$let[weather-1-enUS;${emojis.general.error} No data was found for this query]
$let[weather-2-enUS;This city/country doesn't exist or no weather data for it is listed.]

    `}