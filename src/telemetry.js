const { links } = require("../../index");

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
        $addField[Type;$replaceText[$replaceText[$checkCondition[$guildID==];false;Server];true;DM];yes]

    $elseIf[$mentioned[1]==$clientID]

        $description[\`\`\`
$replaceText[$replaceText[$message;$getServerVar[prefix];()];\`;]\`\`\`]

        $addField[Platform;$toLocaleUppercase[$platform];yes]
        $addField[User ID;$authorID;yes]
        $addField[Type;$replaceText[$replaceText[$checkCondition[$guildID==];false;Server];true;DM];yes]

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

$let[commandname;$replaceText[$replaceText[$message[1];<@!$clientID>;];$getServerVar[prefix];]]

$onlyIf[$isBot[$authorID]==false;]
$onlyIf[$userExists[$authorID]==true;]
$onlyIf[$checkCondition[$toLowercase[$message[1]]==js]==false;]
$onlyIf[$checkCondition[$toLowercase[$message[1]]==e]==false;]

$textSplit[$message[1];]
    `,
};
