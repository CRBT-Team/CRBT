const { tokens } = require("../../../index");

module.exports.command = {
    name: "ocr",
    aliases: ["itt", "imagetotext"],
    module: "tools",
    description_enUS: "Parses text found within a given image.",
    usage_enUS: "<image URL | attachment>",
    code: `
$reply[$messageID;
{author:Optical Character Recognition - Results}

{description:
\`\`\`
$getObjectProperty[ParsedResults[0].ParsedText]
\`\`\`
}

{footer:Warning∶ Results may not be 100% accurate | Realized in $getObjectProperty[ProcessingTimeInMilliseconds]ms}

{thumbnail:$get[message]}

{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$getObjectProperty[ParsedResults[0].TextOverlay.Message]!=No lines found;Couldn't find text in this image...]

$onlyIf[$getObjectProperty[OCRExitCode]!=99;{execute:args}]

$botTyping

$createObject[$jsonRequest[https://api.ocr.space/parse/imageurl?apikey=${tokens.ocr}&url=$get[message]&scale=true&OCREngine=2]]

$onlyIf[$isValidLink[$get[message]]==true;{execute:args}]

$onlyIf[$get[message]!=;{execute:args}]

$let[message;$replaceText[$replaceText[$checkCondition[$message==];false;$message];true;$messageAttachment]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}
/*
Old API
$createObject[$jsonRequest[https://api.ocr.space/parse/imageurl?apikey=${tokens.ocr}&url=$get[message]&scale=true&OCREngine=2]]
*/