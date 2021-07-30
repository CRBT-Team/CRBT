module.exports.command = {
    name: "avatar",
    aliases: ["pfp", "av"],
    module: "info",
    description_enUS: "Retrieves a specified user's profile picture in multiple resolutions and formats. Returns yours if no arguments are used.",
    description_enUK: "Gets a specified user's profile picture in multiple resolutions and formats. You can also get your own if you do not give a user.",
    description_frFR: "Récupère l'image de la photo de profil d'un utilisateur spécifié en résolutions et formats multiples. Montre la vôtre si personne n'est spécifié.",
    description_ru: "Возвращает аватар указанного пользователя в нескольких разрешениях и форматах. Возвращает ваш, если не были указаны аргументы.",
    usage_enUS: "<user ID | username | @mention (optional)>",
    usage_enUK: "<User ID  |  Username  |  @mention> (optional)",
    usage_frFR: "<ID utilisateur | nom d'utilisateur | @mention> (optionnel)",
    usage_ru: "<ID пользователя | имя пользователя | @упоминание> (Необязательно)",
    examples_enUS: [
        "avatar CRBT",
        "pfp 327690719085068289",
        "av CRBT Dev#6796"
    ],
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$findUser[$message];64]}

{field:$get[res-$getGlobalUserVar[language]]:
**[4096]($replaceText[$get[avatar]?size=4096;webp;png])** | **[2048]($replaceText[$get[avatar]?size=2048;webp;png])** | **[1024]($replaceText[$get[avatar]?size=1024;webp;png])** | **[512]($replaceText[$get[avatar]?size=512;webp;png])** | **[256]($replaceText[$get[avatar]?size=256;webp;png])** | **[128]($replaceText[$get[avatar]?size=128;webp;png])**
:no}

{field:$get[formats-$getGlobalUserVar[language]]:
**[PNG]($replaceText[$replaceText[$get[avatar]?size=512;gif;png];webp;png])** | **[WEBP]($replaceText[$get[avatar]?size=512;gif;webp])** | **[JPG]($replaceText[$replaceText[$get[avatar]?size=512;gif;jpg];webp;jpg]) $replaceText[$replaceText[$checkContains[$get[avatar]?size=512;.gif];true;| [GIF]($replaceText[$get[avatar]?size=512;webp;gif])];false;]**
:no}

{image:$replaceText[$get[avatar]?size=2048;webp;png]}

{color:$getGlobalUserVar[color]}
;no]

$let[avatar;$userAvatar[$get[id];]]

$let[title-enUS;$userTag[$get[id]] - Profile picture]
$let[res-enUS;Resolutions (in pixels)]
$let[formats-enUS;Formats]

$let[title1-enUK;$userTag[$get[id]] - Profile picture]
$let[res-enUK;Resolutions in pixels]
$let[formats-enUS;File formats]

$let[title1-frFR;$userTag[$get[id]] - Photo de profil]
$let[res-frFR;Résolutions (en pixels)]
$let[formats-frFR;Formats]

$let[title1-ru;Аватар $userTag[$get[id]]]
$let[res-ru;Разрешение (в пикселях)]
$let[formats-ru;Форматы]

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