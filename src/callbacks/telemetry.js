const { links, illustrations, colors } = require("../../index");

module.exports.command = {
  name: "$alwaysExecute",
  code: `
$useChannel[${links.channels.telemetry}]

$if[$getGlobalUserVar[telemetry]==complete]

    $if[$checkContains[$message[1];$getServerVar[prefix]]==true]
        
        $description[\`\`\`
$replaceText[$replaceText[$message;$getServerVar[prefix];()];\`;]\`\`\`]

        $addField[Platform;$toLocaleUppercase[$platform];yes]
        $addField[User ID;$authorID;yes]
        $addField[Type;$replaceText[$replaceText[$checkCondition[$channelType==dm];false;Server];true;DM];yes]

    $elseIf[$mentioned[1]==$clientID]

        $description[\`\`\`
$replaceText[$replaceText[$message;$getServerVar[prefix];()];\`;]\`\`\`]

        $addField[Platform;$toLocaleUppercase[$platform];yes]
        $addField[User ID;$authorID;yes]
        $addField[Type;$replaceText[$replaceText[$checkCondition[$channelType==dm];false;Server];true;DM];yes]

    $endelseif
    $endif

$else

    $if[$checkContains[$message[1];$getServerVar[prefix]]==true]
            
\`\`\`
()$get[commandname]\`\`\`

    $elseIf[$mentioned[1]==$clientID]

\`\`\`
()$get[commandname]\`\`\`

    $endelseif
    $endif

$endif

$let[commandname;$replaceText[$message[1];$getServerVar[prefix];]]

$onlyIf[$isBot[$authorID]==false;]
$onlyIf[$userExists[$authorID]==true;]
$onlyIf[$checkCondition[$toLowercase[$message[1]]==js]==false;]
$onlyIf[$checkCondition[$toLowercase[$message[1]]==eval]==false;]
$onlyIf[$checkCondition[$toLowercase[$message[1]]==e]==false;]

$onlyIf[$stringStartsWith[$message[1];$getServerVar[prefix]]==true;]
    `}
