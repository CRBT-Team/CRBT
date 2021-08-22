const { emojis, colors, illustrations, links, logos } = require("../../../index"); 

module.exports.command = {
    name: "telemetry",
    aliases: ["datacollect", "privacypolicy", "privacy", "data-collect", "data"],
    description_enUS: "Shows CRBT's privacy policy.",
    module: "basic",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
{description:$get[desc-$getGlobalUserVar[language]]}
{field:Upon using CRBT's commands:
Upon triggering CRBT with a command (e.g. \`$getServerVar[prefix]ping\`), info such as the command name, options, your user ID, the platform you're using (Desktop/Mobile/Web) as well as some analytics on some specific commands are logged.}
{field:When inviting or kicking CRBT:
Whenever you invite CRBT into your server, or kick it out (D:), a log is sent with the server name & ID (in case of abuse).
}
{field:More info:
To learn more about CRBT's telemetry, please read the **[Privacy policy](${links.privacypolicy})**.
**Note:** We recently took away the Minimal mode toggle and telemetry configuration.}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;CRBT - Telemetry]
$let[desc-enUS;CRBT collects some of your data in multiple forms:]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}