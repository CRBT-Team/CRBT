const { colors, emojis } = require("../../index");

module.exports.command = {
    name: "color",
    module: "settings",
    aliases: ["set_color", "colour", "setcolor", "setcolour", "set_colour", "set-color", "set-colour"],
    code: `
$if[$message==]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$authorID;64]}
    {description:
    ${emojis.corec}
    }
    {thumbnail:https://api.alexflipnote.dev/color/image/$getGlobalUserVar[color]}
    ;no]

$else

    $setGlobalUserVar[color;$get[color]]

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {description:$get[description-$getGlobalUserVar[language]]}
    {color:#$get[color]}
    ;no]
        
    $let[title-enUS;${emojis.general.success} Accent color updated]
    $let[description-enUS;$username[$clientID] will now use this color across all commands you execute!]

    $let[color;$replaceText[$replaceText[$checkCondition[$getObjectProperty[colors.$toLowercase[$message]]!=];true;$getObjectProperty[colors.$toLowercase[$message]]];false;$toLowercase[$message]]]

$endif

$djsEval[const { colors } = require("../../../../../index");
d.object.colors = colors]
$createObject[{}]
    `}