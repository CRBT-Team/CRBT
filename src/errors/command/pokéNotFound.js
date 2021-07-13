const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "pokéNotFound",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Who's that Pokémon?]
$let[description-enUS;Couldn't find his Pokémon. Make sure to check your spelling or this beautiful [web Pokédex](https://www.pokemon.com/us/pokedex/) for all Pokémon.]
    `}