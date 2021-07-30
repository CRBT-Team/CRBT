const { tokens } = require("../../../index");

module.exports.command = {
    name: "ocr",
    aliases: ["itt", "imagetotext"],
    module: "tools",
    description_enUS: "Parses text found within a given image.",
    usage_enUS: "<image URL | attachment>",
    cooldown: "15s",
    code: `
$reply[$messageID;
{author:Optical Character Recognition - Results}

{description:
\`\`\`
$getObjectProperty[ParsedResults[0].ParsedText]
\`\`\`
}

{footer:Warning∶ Results may not be accurate • Processed in $getObjectProperty[ProcessingTimeInMilliseconds]ms}

{thumbnail:$get[message]}

{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$getObjectProperty[ParsedResults[0].ParsedText]!=;{execute:queryNotFound}]
$onlyIf[$getObjectProperty[ParsedResults[0].TextOverlay.Message]!=No lines found;{execute:queryNotFound}]

$onlyIf[$getObjectProperty[OCRExitCode]!=99;{execute:args}]

$onlyIf[$getObjectProperty[ErrorMessage]!=Image size is too small for OCR Engine 2. Please use Engine 1.;{execute:ocr2}]

$createObject[$jsonRequest[https://api.ocr.space/parse/imageurl?apikey=${tokens.ocr}&url=$get[message]&scale=true&OCREngine=2]]

$onlyIf[$isValidLink[$get[message]]==true;{execute:args}]

$onlyIf[$get[message]!=;{execute:args}]

$let[message;$replaceText[$replaceText[$checkCondition[$message==];false;$message];true;$messageAttachment]]

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}