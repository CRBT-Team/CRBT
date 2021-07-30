const { links, emojis, colors, items } = require("../../../index");

module.exports.awaitedCommand = {
    name: "experimentalFeatures",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Bleep bloop.]
$let[description-enUS;This command is currently under the "Experimental Features" flag. 
You can enable this flag by using the \`$getServerVar[prefix]flags +experimentalFeatures\` command.
Learn more about flags and experimental features **[here](${links.experiments})**.
]
    `}