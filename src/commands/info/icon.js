module.exports.command = {
    name: "icon",
    aliases: ["servericon"],
    module: "info",
    description_enUS: "Retrieves a specified user's profile picture in multiple resolutions and formats. Returns yours if no arguments are used.",
    usage_enUS: "<user ID | username | @mention> (optional)",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$get[avatar]}

{field:$get[res-$getGlobalUserVar[language]]:
**[4096]($replaceText[$get[avatar]?size=4096;webp;png])** | **[2048]($replaceText[$get[avatar]?size=2048;webp;png])** | **[1024]($replaceText[$get[avatar]?size=1024;webp;png])** | **[512]($replaceText[$get[avatar]?size=512;webp;png])** | **[256]($replaceText[$get[avatar]?size=256;webp;png])** | **[128]($replaceText[$get[avatar]?size=128;webp;png])**
:no}

{field:$get[formats-$getGlobalUserVar[language]]:
**[PNG]($replaceText[$replaceText[$get[avatar]?size=512;gif;png];webp;png])** | **[WEBP]($replaceText[$get[avatar]?size=512;gif;webp])** | **[JPG]($replaceText[$replaceText[$get[avatar]?size=512;gif;jpg];webp;jpg]) $replaceText[$replaceText[$checkContains[$get[avatar]?size=512;.gif];true;| [GIF]($replaceText[$get[avatar]?size=512;webp;gif])];false;]**
:no}

{image:$replaceText[$get[avatar]?size=2048;webp;png]}

{color:$getGlobalUserVar[color]}
;no]

$let[avatar;$serverIcon[$get[id];]]

$let[title-enUS;$serverName[$get[id]] - Icon]
$let[res-enUS;Resolutions (in pixels)]
$let[formats-enUS;Formats]

$onlyIf[$serverIcon[$get[id]]!=null;{execute:serverIconMissing}]

$if[$message==]
    $let[id;$guildID]
    $onlyIf[$channelType!=dm;{execute:guildOnly}]
$else
    $let[id;$message]
    $onlyIf[$serverExists[$message]==true;{execute:args}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}