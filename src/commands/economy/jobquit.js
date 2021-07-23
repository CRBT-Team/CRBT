const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "jobquit",
    aliases: ["job-quit", "job_quit", "j-quit", "jquit"],
    description_enUS: "Removes your job and all previously earned job XP and levels.",
    module: "economy",
    code: `
$deleteGlobalUserVar[job_xp]
$deleteGlobalUserVar[job_propositions]
$deleteGlobalUserVar[job_level]
$deleteGlobalUserVar[job_req]
$deleteGlobalUserVar[job_type]

$reply[$messageID;
{title:${emojis.success} You've successfully left your job!}
{description:
You lost all of your previously earned job XP, levels and progression.
To get a new job, search for jobs using the \`$getServerVar[prefix]jobsearch\` command.
}
{color:${colors.success}}
;no]

$onlyIf[$getGlobalUserVar[job_type]!=$getVar[job_type];{execute:noJob}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}