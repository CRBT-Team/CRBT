module.exports.command = {
    name: "sex",
    usage_enUS: "<question>",
    description: "the sex command <:dorime:672820709436686355>",
    module: "partnerCmd",
    cooldown: "1s",
    server: "782584672298729473",
    code: `
$setGlobalUserVar[sexes;$sum[$getGlobalUserVar[sexes];1]]
$setGlobalUserVar[sexlogs;<@!$randomUserID>, $getGlobalUserVar[sexlogs]]

$reply[$messageID;
{title:sex status}

{description:
You just $randomText[ ; ;brutaly ; ; ; ;]sexed <@!$randomUserID>!!
}

{field:Virgnity level:
$random[-200;1000]%
:yes}

{field:Recent activity:
You $replaceText[$replaceText[$checkCondition[$getGlobalUserVar[sexes]==1];true;only];false;] have sexed $sum[$getGlobalUserVar[sexes];1] $replaceText[$replaceText[$checkCondition[$getGlobalUserVar[sexes]==1];true;person];false;people]!

<@!$randomUserID>
$splitText[1]
$splitText[2]
$splitText[3]
$splitText[4]
:no}

{color:$getGlobalUserVar[color]}
;no]

$textSplit[$replaceText[$getGlobalUserVar[sexlogs];,;AAA];AAA]

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$onlyForServers[$commandInfo[$commandName;server];]
`}