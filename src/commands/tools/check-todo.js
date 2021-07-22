const { emojis, colors } = require("../../..");

module.exports.command = {
    name: "checktodo",
    aliases: ['check','check-todo', 'todo-check', 'checklist', 'check-list','check-list','list-'],
    module: "tools",
    description_enUS: "Removes an item from your To-Do list.",
    usage_enUS: "<item to remove>",
    code: `
$setGlobalUserVar[todolist;$replaceText[$get[newlist];
• $get[item];]]

$reply[$messageID;
{title:${emojis.success} Item removed from your To-Do list!}

{description:
\`\`\`
$replaceText[$get[newlist];
• $get[item];]\`\`\`
}

{color:${colors.success}}
;no]

$onlyIf[$checkContains[$get[newlist]\n;• $get[item]\n]==true;{execute:todoInvalidItem}]

$let[newlist;$replaceText[$getGlobalUserVar[todolist];\n-;\n•]]

$let[item;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;*;];\`;];_;];#RIGHT#;];#LEFT#;]]

$argsCheck[>1;{execute:args}]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}