const { emojis, colors, illustrations, links } = require("../../index"); 

module.exports.command = {
    name: "telemetry",
    aliases: ["datacollect", "privacypolicy", "privacy", "data-collect", "data"],
    description_enUS: "Gets CRBT's privacy policy or changes your telemetry mode.",
    usage_enUS: "<minimalist | complete (optional)>",
    module: "settings",
    code: `
$if[$message==]

    $reply[$messageID;
    {author:$get[info1-$getGlobalUserVar[language]]:${illustrations.settings}}
    {description:$get[info2-$getGlobalUserVar[language]]}
    {color:$getGlobalUserVar[color]}
    ;no]

$elseIf[$checkContains[$toLowercase[$message[1]];true;on;enable;1;complete]==true]

    $setGlobalUserVar[telemetry;complete]
    $reply[$messageID;
    {title:$splitText[1]}
    {description:$splitText[2]
    $get[complete2-$getGlobalUserVar[language]]}
    {color:${colors.green}}
    ;no]

    $textSplit[$get[complete1-$getGlobalUserVar[language]];/]

    $onlyIf[$getGlobalUserVar[telemetry]!=complete;{execute:dataAlr}]

$endelseIf
$elseIf[$checkContains[$toLowercase[$message[1]];false;off;disable;0;minimal]==true]

    $setGlobalUserVar[telemetry;minimal]
    $reply[$messageID;
    {title:$splitText[1]}
    {description:$splitText[2]
    $get[minimal2-$getGlobalUserVar[language]]
    }
    {color:${colors.green}}
    ;no]

    $textSplit[$get[minimal1-$getGlobalUserVar[language]];/]

    $onlyIf[$getGlobalUserVar[telemetry]!=minimal;{execute:dataAlr}]

$endelseIf
$else
    $loop[1;args]
$endif


$let[info1-enUS;CRBT Settings - Telemetry]
$let[info2-enUS;You're currently on the **$toLocaleUppercase[$getGlobalUserVar[telemetry]] mode**, which upon using CRBT grants Clembs access to:
$get[$getGlobalUserVar[telemetry]2-$getGlobalUserVar[language]]
To learn more about CRBT Telemetry, please read the **[Privacy policy](${links.privacypolicy})**.
You can disable or enable telemetry by using \`$getServerVar[prefix]telemetry $commandInfo[telemetry;usage_enUS]\`.]

$let[complete1-enUS;${emojis.general.success} Telemetry set to Complete mode. / Clembs will now have access to the following information:]
$let[complete2-enUS;- The command name + the arguments (what come after the command name)
- Where the command was executed (DMs/Server)
- Your user ID
- The platform (Desktop/Mobile/Web)]
$let[minimal1-enUS;${emojis.general.success} Telemetry set to Minimal mode. / Clembs will now have access to the following information:]
$let[minimal2-enUS;- The command name]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}