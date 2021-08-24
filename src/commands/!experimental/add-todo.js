const { colors, emojis } = require("../../..");

module.exports.command = {
    name: "addtodo",
    aliases: ['add-todo','new-todo', 'todo-add', 'addlist', 'add-list','new-list','list+', 'todo', 'list'],
    module: "tools",
    description_enUS: "Adds an item to your To-Do list.",
    usage_enUS: "<new item>",
    slashCmd: 'todo add item:<args>',
    code: `
$setGlobalUserVar[todolist;$get[newlist]
• $get[item]]

$reply[$messageID;
{title:${emojis.success} Item added to your To-Do list.}

{description:
\`\`\`
$get[newlist]
• $get[item]\`\`\`
}

{color:${colors.success}}
;no]

$onlyIf[$get[item]!=;]

$let[newlist;$replaceText[$getGlobalUserVar[todolist];\n-;\n•]]

$let[item;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;*;];\`;];_;];#RIGHT#;];#LEFT#;]]

$onlyIf[$message!=;]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}