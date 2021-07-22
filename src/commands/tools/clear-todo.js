const { emojis, colors } = require("../../..");

module.exports.command = {
    name: "cleartodo",
    aliases: ['clear-todo','clear_todo', 'todo-clear', 'clearlist', 'clear-list','clear_list','listdelete', 'deletetodo'],
    module: "tools",
    description_enUS: "Clears your entire To-Do list.",
    code: `
$setGlobalUserVar[todolist;$getVar[todolist]]

$reply[$messageID;
{title:${emojis.success} To-Do list cleared}

{description:
\`\`\`
$get[newlist]
\`\`\`
}

{color:${colors.success}}
;no]

$let[newlist;$replaceText[$getGlobalUserVar[todolist];\n-;\n•]]

$argsCheck[0;{execute:args}]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}