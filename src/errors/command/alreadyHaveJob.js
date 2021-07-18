const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "alreadyHaveJob",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{footer:$get[footer-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You already have a job!]
$let[description-enUS;You can't search for other jobs while you already have one. To leave your job, use \`$getServerVar[prefix]jobquit\`.]
    `}