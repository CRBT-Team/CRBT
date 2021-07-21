module.exports.command = {
    name: "ascii",
    module: "fun",
    aliases: ["asciiart", "say"],
    description_enUS: "Converts your text into a 2000's style ASCII art.",
    usage_enUS: "<text>",
    code: `
$reply[$messageID;
\`\`\`
$jsonRequest[https://artii.herokuapp.com/make?text=$message]\`\`\`
;no]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}