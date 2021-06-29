const { tokens, illustrations } = require("../../../index");

module.exports.command = {
    name: "weather",
    aliases: ["weathersearch", "weather-search", "weather_search"],
    description: "Searches the weather for the specified city.",
    module: "infos",
    usage: "<city name (none to get the previous results)>",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$get[image]}
{field:$get[temperature-$getGlobalUserVar[language]]:yes}
{field:$get[humidity-$getGlobalUserVar[language]]:yes}
{field:$get[UV-$getGlobalUserVar[language]]:yes}
{field:$get[wind-$getGlobalUserVar[language]]:yes}
{field:$get[cloud-$getGlobalUserVar[language]]:yes}
{field:$get[pressure-$getGlobalUserVar[language]]:yes}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$getObjectProperty[result.location.name], $getObjectProperty[result.location.country] - Weather]

$let[temperature-enUS;Temperature:$getObjectProperty[result.weather.temperature.celcius]°C or $getObjectProperty[result.weather.temperature.fahrenheit]°F\n(Feels like $getObjectProperty[result.weather.feelslike.celcius]°C or $getObjectProperty[result.weather.feelslike.fahrenheit]°F)]

$let[humidity-enUS;Humidity: $getObjectProperty[result.weather.humidity]]

$let[UV-enUS;UV:$getObjectProperty[result.weather.uv]]

$let[wind-enUS;Wind speed:$getObjectProperty[result.weather.wind.kilometersPerHour] km/h or $getObjectProperty[result.weather.wind.milesPerHour] mph]

$let[cloud-enUS;Cloud coverage:$getObjectProperty[result.weather.cloudCoverage]]

$let[pressure-enUS;Pressure:$getObjectProperty[result.weather.pressure.millibars] millibars]

$let[image;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getObjectProperty[result.weather.condition];Light rain;https://cdn.discordapp.com/attachments/843148633687588945/859115102467653642/unknown.png];Moderate rain;https://cdn.discordapp.com/attachments/843148633687588945/859115102467653642/unknown.png];Sunny;https://cdn.discordapp.com/attachments/843148633687588945/859115082479173703/unknown.png];Partly cloudy;https://cdn.discordapp.com/attachments/843148633687588945/859115092855881768/unknown.png];Moderate or heavy rain with thunder;https://cdn.discordapp.com/attachments/843148633687588945/859115112337768478/unknown.png]]

$if[$message!=]
    $setGlobalUserVar[city;$getObjectProperty[result.location.name], $getObjectProperty[result.location.country]]
    $onlyIf[$getObjectProperty[success]==true;{title:No data was found for the city \`$message\`.} {color:red}]
    $createObject[$jsonRequest[https://beta-api.tk/api/info/weather?authKey=${tokens.apis.betaApi}&location=$message]]
$else
    $onlyIf[$getObjectProperty[success]==true;{title:No data was found for this city.} {color:red}]
    $createObject[$jsonRequest[https://beta-api.tk/api/info/weather?authKey=${tokens.apis.betaApi}&location=$getGlobalUserVar[city]]]
$endif

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}