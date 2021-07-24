const { emojis, illustrations, colors } = require("../../../index");

module.exports.command = {
    name: "8ball",
    module: "fun",
    aliases: ["8b"],
    description_enUS: "Askes your question to 8-Ball and gives you its honest answer.",
    usage_enUS: "<question>",
    code: `
$editMessage[$get[id];
{author:$get[title-$getGlobalUserVar[language]]:${illustrations.eightball}}
$if[$checkContains[$toLowercase[$message];who]==true]

    {description:$get[who-$getGlobalUserVar[language]]}
    {color:$getGlobalUserVar[color]}

$elseIf[$checkContains[$toLowercase[$message];when will;when is;when am;when are]==true]

    {description:$get[whenFuture-$getGlobalUserVar[language]]}
    {color:$getGlobalUserVar[color]}

$endelseIf
$elseIf[$checkContains[$toLowercase[$message];when did;when has;when was;when]==true]

    {description:$get[whenPast-$getGlobalUserVar[language]]}
    {color:$getGlobalUserVar[color]}

$endelseIf
$else

    {description:
    $replaceText[$replaceText[$checkCondition[$get[$get[answer-$getGlobalUserVar[language]]-$getGlobalUserVar[language]]==];false;$get[$get[answer-$getGlobalUserVar[language]]-$getGlobalUserVar[language]]];true;$get[answer-$getGlobalUserVar[language]]]
    }
    {color:$get[color]}

$endif
;$channelID]

$wait[500ms]

$let[id;$botLastMessageID]

$reply[$messageID;
{title:$get[progress-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;8-Ball]

$let[who-enUS;$randomText[I think it's <@!$randomUserID>.;For sure, it's <@!$randomUserID>.;I'm pretty confident to say it is <@!$randomUserID>.]]

$let[whenFuture-enUS;$randomText[Likely tomorrow.;Maybe later today.;Hopefully soon.;Probably next week.;Never.;In a couple of months.;In several years from now.]]

$let[whenPast-enUS;$randomText[I think it was yesterday.;Wasn't it last week?;My sources say it was several years ago.;If I recall correctly... never.;I'm pretty sure it was a long long time ago.]]

$if[$checkContains[$toLowercase[$message];I;myself;me]$checkContains[$toLowercase[$message];suicide;die;kill;murder;hang]$checkContains[$toLowercase[$message];not]==truetruefalse]

$let[answer-enUS;You have so much to live for. <:sad:717683548487811111>]

$let[color;${colors.red}]

$else

$let[color;$replaceText[$replaceText[$replaceText[$get[answer-enUS];negative;${colors.red}];positive;${colors.green}];neutral;${colors.orange}]]

$let[answer-enUS;$randomText[neutral;negative;positive]]

$let[neutral-enUS;${emojis.colors.orange}  $randomText[I'm not sure...;Sort of...]]

$let[negative-enUS;${emojis.colors.red}  $randomText[Definitely, no.;Nah...;It may seem like it's a yes, but in fact nope!;Maybe not.]]

$let[positive-enUS;${emojis.colors.green}  $randomText[Yeah!;Absolutely.;As I see it, yes.;Probably.;Of course!]]

$endif

$let[progress-enUS;$randomText[Hmmmm...;Let me think...;Thinking in progress...;Loading answers...]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}