module.exports.command = {
    name: "userbanner",
    module: "info",
    aliases: ["ub", "ubanner", "user-banner", "user_banner"],
    description_enUS: "Retrieves multiple versions of a user's Discord banner (click **[here](https://support.discord.com/hc/en-us/articles/4403147417623-Custom-Profiles)** to learn how to change your banner!).\nNote: This is not the same banner as your CRBT Profile banner. To fetch a user's CRBT Profile banner (assuming they have one), use \`<prefix>profile <user>\`.",
    usage_enUS: "<user ID | username | @mention (optional)>",
    examples_enUS: [
        "userbanner 668504599325310977",
        "ub dave#1866"
    ],
    code: `
$reply[$messageID;
{author:$userTag[$get[id]] - Discord banner:$userAvatar[$get[id];64]}

{field:Resolutions (in pixels):
**[4096]($get[banner]4096)** | **[2048]($get[banner]2048)** | **[1024]($get[banner]1024)** | **[512]($get[banner]512)** | **[256]($get[banner]256)** | **[128]($get[banner]128)**
:no}

{field:Formats:
**[PNG]($replaceText[$get[banner]512;gif;png])** | **[WEBP]($replaceText[$replaceText[$get[banner]512;gif;webp];png;webp])** | **[JPG]($replaceText[$replaceText[$get[banner]512;gif;jpg];png;jpg])** $replaceText[$replaceText[$get[animated];true;| **[GIF]($get[banner]512)**];false;]
:no}

{image:$get[banner]2048}

{color:$getGlobalUserVar[color;$get[id]]}
;no]

$onlyIf[$get[banner]!=https://cdn.discordapp.com/banners/$get[id]/.png?size=;{execute:userNoBanner}]

$let[banner;https://cdn.discordapp.com/banners/$get[id]/$get[hash].$replaceText[$replaceText[$get[animated];false;png];true;gif]?size=]

$let[animated;$stringStartsWith[$get[hash];a_]]

$let[hash;$jsonRequest[https://discordapp.com/api/users/$get[id];banner;;Authorization:Bot $clientToken]]

$if[$message==]
    $let[id;$authorID]
$else
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message;no]!=undefined;{execute:usernotfound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}