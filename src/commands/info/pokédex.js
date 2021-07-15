const {emojis, colors} = require("../../../index");

module.exports.command = {
    name: "pokedex",
    aliases: ["pokemoninfo", "poke-stats", "poke_stats","pokestats","poke","pokemon","poke-info","pokeinfo","pokéinfo","pokémon","poke_info"],
    description_enUS: "Gives information about the specified Pokémon from the Pokédex.",
    module: "info",
    usage_enUS: "<Pokémon name>",
    code: `
$reply[$messageID;
{author:$toLocaleUppercase[$getObjectProperty[name]] (#$getObjectProperty[id]) - Pokédex info:https://cdn.clembs.xyz/pXsAQ5s.png}

{description:
**[Open in Pokémon's website](https://www.pokemon.com/us/pokedex/$getObjectProperty[name])**
}

{field:Description:
$getObjectProperty[description]
First appeared in the $ordinal[$getObjectProperty[generation]] generation.
}

{field:Type:
$replaceText[$getObjectProperty[type];,;, ]
:no}

{field:HP:$getObjectProperty[stats.hp]:yes}
{field:Attack:$getObjectProperty[stats.attack]:yes}
{field:Defense:$getObjectProperty[stats.defense]:yes}
{field:Special Attack:$getObjectProperty[stats.sp_atk]:yes}
{field:Special Defense:$getObjectProperty[stats.sp_def]:yes}
{field:Speed:$getObjectProperty[stats.speed]:yes}
{field:Weight:$getObjectProperty[weight]:yes}
{field:Height:$replaceText[$getObjectProperty[height];″;"]:yes}

{field:Evolutions:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[family.evolutionLine]==];true;None];false;$replaceText[$getObjectProperty[family.evolutionLine];,;, ]]
:no}

{field:Abilities:
$replaceText[$getObjectProperty[abilities];,;, ]
:no}

{thumbnail:https://assets.pokemon.com/assets/cms2/img/pokedex/full/$getObjectProperty[id].png}

{color:$getGlobalUserVar[color]}
;no]

$createObject[$jsonRequest[https://some-random-api.ml/pokedex?pokemon=$message;;{execute:queryNotFound}]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}