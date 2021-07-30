module.exports.command = {
    name: "aoijs",
    aliases: ["aoi"],
    module: "admin",
    description_enUS: "Gives aoi.js' documentation on a given query or function",
    usage_enUS: "<aoi.js function | search>",
    examples_enUS: [
        "aoi $findUser",
        "aoijs $reply"
    ],
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.clembs.xyz/kam0X4w.png}

{description:
**[$get[webDocs-$getGlobalUserVar[language]]](https://aoi.leref.ga/functions/$toLowercase[$replaceText[$jsonRequest[https://dbdjs.leref.ga/search/\$$replaceText[$message;\$;];function.name];\$;usd]])**
}

{field:$get[description-$getGlobalUserVar[language]]:
$getObjectProperty[function.description]
:no}

{field:$get[usage-$getGlobalUserVar[language]]:
\`\`\`
$jsonRequest[https://dbdjs.leref.ga/search/\$$replaceText[$message;\$;];function.usage]
\`\`\`
:no}

{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$jsonRequest[https://dbdjs.leref.ga/search/\$$replaceText[$message;\$;];function.name] - Function info]
$let[description-enUS;Description]
$let[usage-enUS;Usage]
$let[webDocs-enUS;Web documentation]

$onlyIf[$getObjectProperty[error]==;{execute:queryNotFound}]

$createObject[$jsonRequest[https://dbdjs.leref.ga/search/\$$replaceText[$message;\$;]]]

$onlyIf[$jsonRequest[https://dbdjs.leref.ga]!=;api down xd]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}