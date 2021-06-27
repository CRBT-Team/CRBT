module.exports.command = {
    name: "aoijs",
    aliases: ["aoi", "dbdjs", "dbd"],
    module: "info",
    description_enUS: "Gives a description and a usage example for a given Aoi.js function.",
    usage_enUS: "<name of an Aoi.js function (e.g. $findUser)>",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.clembs.xyz/kam0X4w.png}

{description:
**[$get[webDocs-$getGlobalUserVar[language]]](https://aoi.leref.ga/functions/$replaceText[$toLowercase[$getObjectProperty[function.name]];$;usd])**
}

{field:$get[description-$getGlobalUserVar[language]]:
$getObjectProperty[function.description]
:no}

$if[$jsonRequest[https://dbdjs.leref.ga/search/\$$replaceText[$message;\$;];function.usage]!=]
{field:$get[usage-$getGlobalUserVar[language]]:
\`\`\`
$jsonRequest[https://dbdjs.leref.ga/search/\$$replaceText[$message;\$;];function.usage]
\`\`\`
:no}
$endif

{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$getObjectProperty[function.name] - Information]
$let[description-enUS;Description]
$let[usage-enUS;Usage]
$let[webDocs-enUS;Web documentation]

$onlyIf[$getObjectProperty[error]==;{execute:aoiMissingFunction}]

$createObject[$jsonRequest[https://dbdjs.leref.ga/search/\$$replaceText[$message;\$;]]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}