module.exports.command = {
    name: "rps",
    aliases: ["rockpaperscissors"],
    description_enUS: "Starts a game of rock paper scissors.",
    module: "fun",
    code: `
$setUserVar[temp3;$authorID;$clientID]

$apiMessage[;
{title:Rock Paper Scissors}
{description:Choose rock, paper or scissors}
{color:$getGlobalUserVar[color]}
;{actionRow:Paper,2,2,paper,📃:Rock,2,2,rock,🪨:Scissors,2,2,scissors,✂️}
;$messageID:false;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}