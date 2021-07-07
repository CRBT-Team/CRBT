module.exports.command = {
    name: "npm",
    aliases: ["npminfo", "npm-info", "npm_info","packageinfo"],
    description_enUS: "Gives information on a specified npm package.",
    module: "info",
    usage: "<npm package name (e.g. discord.js, ytdl-core)>",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.clembs.xyz/ZgJCsA8.png}

{description:
**[$get[url-$getGlobalUserVar[language]]](https://npmjs.com/package/$getObjectProperty[collected.metadata.name])**
$getObjectProperty[collected.metadata.description]
}

{field:$get[keywords-$getGlobalUserVar[language]]:no}
{field:$get[publisher-$getGlobalUserVar[language]]:yes}
{field:$get[license-$getGlobalUserVar[language]]:yes}
{field:$get[version-$getGlobalUserVar[language]]:yes}
{field:$get[downloads-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$getObjectProperty[collected.metadata.name] - Package info]
$let[url-enUS;Open in npmjs.com]
$let[install-enUS;Install:\`\`\`\nnpm install $getObjectProperty[collected.metadata.name]\`\`\`]
$let[keywords-enUS;Keywords:\`\`\`$replaceText[$getObjectProperty[collected.metadata.keywords];,;, ]\`\`\`]
$let[publisher-enUS;Publisher:$getObjectProperty[collected.metadata.publisher.username]]
$let[license-enUS;License:$getObjectProperty[collected.metadata.license]]
$let[version-enUS;Latest version:$getObjectProperty[collected.metadata.version]]
$let[downloads-enUS;Downloads:$jsonRequest[https://img.shields.io/npm/dt/$message.json;message]]

$onlyIf[$getObjectProperty[success]!=false;{execute:npmNotFound}]

$createObject[$jsonRequest[https://api.npms.io/v2/package/$message]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}