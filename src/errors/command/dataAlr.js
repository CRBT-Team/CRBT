const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "dataAlr",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{footer:$get[footer-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Nice?]
$let[description-enUS;Telemetry is already set to **$toLocaleUppercase[$getGlobalUserVar[telemetry]] mode**.]
    `}