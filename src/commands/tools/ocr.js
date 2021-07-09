const { tokens } = require("../../../index");

module.exports.command = {
    name: "ocr",
    aliases: ["itt", "imagetotext"],
    module: "tools",
    description_enUS: "Retrieves found text inside of an image.",
    usage_enUS: "<image URL | attachment>",
    code: `
$reply[$messageID;
{author:OCR - Results}

{description:
\`\`\`
$getObjectProperty[message]
\`\`\`
}

{thumbnail:$get[message]}

{color:$getGlobalUserVar[color]}
;no]

$createObject[$jsonRequest[https://normal-api.ml/ocr?image=$get[message]]]

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