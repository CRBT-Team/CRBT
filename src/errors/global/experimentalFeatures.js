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
$let[description-enUS;This command is currently under the Experimental Features toggle. 
You can enable Experimental Features using the \`$getServerVar[prefix]experiments on\` command.
Learn more about this change **[here](${links.experiments})**.
]
    `}