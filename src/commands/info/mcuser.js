module.exports.command = {
    name: "mcinfo",
    aliases: ['minecraft', 'minecraft-info', 'mc-info', 'skin', 'mc','mcskin'],
    description_enUS: "Gives the UUID, the name and the skin of a specified Minecraft Java player.",
    usage_enUS: "<Minecraft Java Edition player name>",
    module: "info",
    code: `
$reply[$messageID;
{author:$getObjectProperty[name] - Minecraft info}
{description:
**[Open in NameMC](https://namemc.com/profile/$getObjectProperty[id])** | **[Open skin](https://crafatar.com/skins/$getObjectProperty[id])**
}
{field:UUID:
$getObjectProperty[id]
:yes}
{image:https://crafatar.com/renders/body/$getObjectProperty[id]?overlay}
{color:$getGlobalUserVar[color]}
;no]

$createObject[$jsonRequest[https://api.mojang.com/users/profiles/minecraft/$toLowercase[$message]]]

$onlyIf[$httpRequest[https://api.mojang.com/users/profiles/minecraft/$toLowercase[$message];GET]!=;{execute:mcUserNotFound}]


$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}