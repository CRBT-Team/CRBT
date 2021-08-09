const { colors, emojis, logos, illustrations, links, api } = require("../../index")

module.exports.command = {
    name: "template",
    module: "basic",
    aliases: ["alias1", "alias2"],
    description_enUS: "description.",
    usage_enUS: "<something cool> <option 1 | option 2 | option 3 (optional)>", //how do you use the cmd
    examples_enUS: [
        "example 1",
        "example 2 (description of example 2)"
    ]
    ,
    botPerms: [""], //required bot permissions
    userPerms: [""], //required user permissions
    code: `
$reply[$messageID;
{title:hi again!}

{description:
what is up?
}

{color:$getGlobalUserVar[color]}
$let[for success messages, use ${colors.success} instead]
$let[for errors, use ${colors.error}!]

;no]

$let[you can change the argsCheck value]
$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}

// for a guildOnly cmd, add this at the end
// $onlyIf[$channelType!=dm;{execute:guildOnly}]
// you can replace the ^ for the opposite
// also change the argsCheck count ofc