const { tokens } = require("../../../index");

module.exports.awaitedCommand = {
    name: "ocr2",
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

$createObject[$jsonRequest[https://api.ocr.space/parse/imageurl?apikey=${tokens.ocr}&url=$get[message]&scale=true&OCREngine=1]]

$if[$message$messageAttachment!=]
    $let[message;$replaceText[$replaceText[$checkCondition[$message==];false;$message];true;$messageAttachment]]
$else
    $let[message;$getChannelVar[lastAttach]]
$endif
    `}