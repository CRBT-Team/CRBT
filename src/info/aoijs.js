const {} = require("../../index");

module.exports.command = {
    name: "aoijs",
    aliases: ["aoi", "dbdjs", "dbd"],
    module: "info",
    description_enUS: "Gives a description and a usage example for a given Aoi.js function.",
    usage_enUS: "<name of an Aoi.js function (e.g. $findUser)>",
    code: `
$reply[$messageID;
{title:$getObjectProperty[name]}

{description:
\`\`\`
$getObjectProperty[description]
\`\`\`}

$if[$getObjectProperty[usage]!=]
{field:$get[usage-$getGlobalUserVar[language]]:
\`\`\`
$getObjectProperty[usage]
:no}
$endif

{color:$getGlobalUserVar[color]}
;no]

$createObject[$jsonRequest[https://dbdjs.leref.ga/search/\$$replaceText[$message;\$;];function]]

$argsCheck[1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
    `}