const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "noJob",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You don't have a job!]
$let[description-enUS;You can get one by simply searching with \`$getServerVar[prefix]jobsearch\`.]
    `}