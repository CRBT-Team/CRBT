const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "unknownSong",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Hmm... that's weird...]
$let[description-enUS;We couldn't find this song in your queue. As a reminder, the queue currently has $queueLength songs. (Check the queue with \`$getServerVar[prefix]queue\`!)]
    `}