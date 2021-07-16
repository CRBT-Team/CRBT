module.exports.command = {
    name: "mcserver",
    module: "info",
    description_enUS: "Gives info about a specified Minecraft Java server.",
    usage_enUS: "<Minecraft Java Edition server IP/hostname>",
    code: `
$reply[$messageID;
{author:$getObjectProperty[hostname] - Minecraft server info}

{description:
$getObjectProperty[motd.clean]
}

{field:IPv4:
\`$getObjectProperty[ip]:$getObjectProperty[port]\`
:no}

{field:Players:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[players.online]==];true;0];false;$numberSeparator[$getObjectProperty[players.online]]]/$numberSeparator[$getObjectProperty[players.max]]
:no}

{field:Version:
$getObjectProperty[software] $replaceText[$replaceText[$getObjectProperty[version];MC;Minecraft: Java Edition];Requires;]
:no}

{field:Status:
$replaceText[$replaceText[$jsonRequest[https://mcapi.xdefcon.com/server/$message/status/json;online];true;Online since <t:$jsonRequest[https://mcapi.us/server/status?ip=$getObjectProperty[hostname];last_online]:R>];false;Offline]
:yes}

{color:$getGlobalUserVar[color]}

$if[$getObjectProperty[icon]!=]
{thumbnail:https://eu.mc-api.net/v3/server/favicon/$message}
$else
{thumbnail:https://cdn.clembs.xyz/4aq9CoU.png}
$endif

;no]

$onlyIf[$httpRequest[https://mcapi.xdefcon.com/server/$message/ping/json;GET;;ping]!=undefined;{execute:queryNotFound}]

$createObject[$jsonRequest[https://api.mcsrvstat.us/1/$message]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}