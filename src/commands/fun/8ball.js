const { emojis } = require("../../../index");

module.exports.command = {
    name: "8ball",
    module: "fun",
    aliases: ["8b"],
    description_enUS: "Askes your question to 8-Ball and gives you its honest answer.",
    usage_enUS: "<question>",
    code: `
$editMessage[$botLastMessageID;
{title:$get[title-$getGlobalUserVar[language]]}
$if[$checkContains[$toLowercase[$message];who]==true]

    {description:$get[who-$getGlobalUserVar[language]]}

$elseIf[$checkContains[$toLowercase[$message];when will;when is;when am;when are]==true]

    {description:$get[whenFuture-$getGlobalUserVar[language]]}

$endelseIf
$elseIf[$checkContains[$toLowercase[$message];when did;when has;when was;when]==true]

    {description:$get[whenPast-$getGlobalUserVar[language]]}

$endelseIf
$else

    {description:$get[answer-$getGlobalUserVar[language]]}

$endif
{color:$getGlobalUserVar[color]}
;$channelID]

$wait[500ms]

$reply[$messageID;
{title:$get[progress-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;${emojis.misc.eightball} 8-Ball]

$let[who-enUS;$randomText[I think it's <@!$randomUserID>.;For sure, it's <@!$randomUserID>.;I'm pretty confident to say it is <@!$randomUserID>.]]

$let[whenFuture-enUS;$randomText[Likely tomorrow.;Maybe later today.;Hopefully soon.;Probably next week.;Never.;In a couple of months.;In several years from now.]]

$let[whenPast-enUS;$randomText[I think it was yesterday.;Wasn't it last week?;My sources say it was several years ago.;If I recall correctly... never.;I'm pretty sure it was a long long time ago.]]

$let[answer-enUS;$randomText[🟢 Yeah!;🔴 Definitely, no.;🟠 I'm not sure...;🔴 Nah...;🔴 It may seem like it's a yes, but in fact nope!;🟢 Absolutely.;🟢 As I see it, yes.;🟠 Sort of...;🔴 Maybe not.;🟢 Probably.;🟢 Of course!]]

$let[progress-enUS;${emojis.misc.eightball} 8-Ball is thinking...]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}