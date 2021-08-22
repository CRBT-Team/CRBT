const { emojis, colors, links } = require("../../../index")

module.exports.command = {
    name: "experiments",
    module: "settings",
    aliases: ["flags"],
    description_enUS: "Toggles the Experimental Features on or off. Use at your own risk.",
    usage_enUS: "<\"on\" | \"off\">",
    code: `
$if[$checkContains[$toLowercase[$message];on;enable;true;1]==true]

$setGlobalUserVar[experimentalFeatures;true]

$reply[$messageID;
{title:${emojis.toggleon}  Experimental features enabled.}
{description:
You can now use these features:
\`\`\`diff
+ Button commands ($get[pre]rps, $get[pre]count)
+ To-Do list commands ($get[pre]todolist)
+ Easter-egg commands (🤫)
+ QR-code creation/scanning ($get[pre]scanqr, $get[pre]createqr)
+ $get[pre]leaderboard
+ $get[pre]pause & $get[pre]resume
+ $get[pre]quote
\`\`\`
**Note:** These commands may have bugs, unfinished UI or features, etc. 
If you've got any suggestions or bug reports, feel free to use \`$get[pre]suggest\` and \`$get[pre]report\`.
**To disable these features, use \`$get[pre]experiments off\`.**
Interested in some more beta features? Join our **[Discord server](${links.info.discord})** and become a Tester!
}
{color:${colors.success}}
;no]

$onlyIf[$getGlobalUserVar[experimentalFeatures]!=true;{execute:valueAlr}]

$elseIf[$checkContains[$toLowercase[$message];off;disable;false;0]==true]

$setGlobalUserVar[experimentalFeatures;false]

$reply[$messageID;
{title:${emojis.toggleoff}  Experimental features disabled.}
{description:
To enable them back, use \`$get[pre]experiments on\`.
}
{color:${colors.error}}
;no]

$onlyIf[$getGlobalUserVar[experimentalFeatures]!=false;{execute:valueAlr}]

$endelseIf
$else
$loop[1;args]
$endif

$let[pre;$getServerVar[prefix]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}