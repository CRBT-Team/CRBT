const { emojis, colors } = require("../../..");

module.exports.command = {
    name: "viewtodo",
    aliases: ['todolist', 'view-todo','viewlist', 'view-list','view_list', 'view_todo', 'list', 'todo'],
    module: "tools",
    description_enUS: "Displays your To-Do list.",
    code: `
$reply[$messageID;
{author:$userTag - To-Do list:$authorAvatar}

{description:
\`\`\`
$get[newlist]
\`\`\`
}

{field:Tips:
Remove any item from your To-Do list with \`$getServerVar[prefix]checktodo <item>\`.
Add an item to your list by using \`$getServerVar[prefix]todo <new item>\`.
Clear your entire To-Do list with the \`$getServerVar[prefix]cleartodo\` command.
}

{color:$getGlobalUserVar[color]}
;no]

$let[newlist;$replaceText[$getGlobalUserVar[todolist];\n-;\n•]]

$argsCheck[0;]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}