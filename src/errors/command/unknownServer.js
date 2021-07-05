const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "unknownServer",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Internal Exception: \`io.crbt.handler.timeout.unknownServer\`]
$let[description-enUS;Couldn't find this Minecraft Java Edition server! Make sure to use a valid host address or that the server is online.]
    `}