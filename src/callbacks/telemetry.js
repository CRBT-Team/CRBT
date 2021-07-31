const { links, illustrations, colors } = require("../../index");

module.exports.command = {
  name: "$alwaysExecute",
  code: `
$useChannel[${links.channels.telemetry}]

$if[$getGlobalUserVar[telemetry]==complete]

    $description[\`\`\`
$replaceText[$replaceText[$replaceText[$message;$getServerVar[prefix] ;()];$getServerVar[prefix];()];\`;]\`\`\`]

    $addField[Platform;$toLocaleUppercase[$platform];yes]
    $addField[User ID;$authorID;yes]

$else

\`\`\`
()$get[commandname]
\`\`\`

$endif

$setUserVar[helpSuggestions;$replaceText[$replaceText[$checkCondition[$get[a]==];true;basic];false;$get[a]]-$splitText[2]-$hasPerms[$authorID;manageserver]]
$textSplit[$getUserVar[helpSuggestions];-]

$let[a;$commandInfo[$toLowercase[$get[commandname]];module]]

$onlyIf[$commandInfo[$toLowercase[$get[commandname]];name]!=djseval;]
$onlyIf[$commandInfo[$toLowercase[$get[commandname]];name]!=eval;]

$let[commandname;$replaceText[$replaceText[ $message; $getServerVar[prefix] ;]; $getServerVar[prefix];]]

$onlyIf[$isBot[$authorID]==false;]
$onlyIf[$userExists[$authorID]==true;]

$onlyIf[$stringStartsWith[$message;$getServerVar[prefix]]==true;]
    `}
