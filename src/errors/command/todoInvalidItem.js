const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "todoInvalidItem",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Hmm?]
$let[description-enUS;This item isn't on your To-Do list. Check your spelling and try again. Your To-Do list can be viewed with \`$getServerVar[prefix]todo\`.]
    `}