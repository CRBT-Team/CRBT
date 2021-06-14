const files = require("../../json/api.json");
const randomPédiluve = Math.floor(Math.random() * files.pédiluve.length);

module.exports.command = {
    name: "pédiluve",
    module: "fun",
    description_enUS: "A random footbath image (secret command).",
    code: `
$reply[$messageID;
{image:${files.pédiluve[randomPédiluve]}}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
    `}