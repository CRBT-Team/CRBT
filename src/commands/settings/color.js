const { colors, emojis, illustrations } = require("../../../index");

module.exports.command = {
    name: "color",
    module: "settings",
    aliases: ["colour","setcolor","setcolour"],
    description_enUS: "Gives information about your color, or changes it if any color name/hex code is given.",
    usage_enUS: "<hexadecimal color code | color name | \"profile\" (optional)>",
    examples_enUS: [
        "setcolor default",
        "color #9099FF",
        "colour light green",
        "color profile (uses your Discord Profile Color)"
    ],
    code: `
$if[$message==]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}
    {description:$get[description-$getGlobalUserVar[language]]}
    {field:‎:
${emojis.colors.lightred} \`Light red\` ($get[default-$getGlobalUserVar[language]])
${emojis.colors.red} \`Red\`
${emojis.colors.darkred} \`Dark red\`
${emojis.colors.orange} \`Orange\`
${emojis.colors.yellow} \`Yellow\`
${emojis.colors.lightgreen} \`Light green\`
${emojis.colors.green} \`Green\`
    :yes}
    {field:‎:
${emojis.colors.darkgreen} \`Dark green\`
${emojis.colors.cyan} \`Cyan\`
${emojis.colors.lightblue} \`Light blue\`
${emojis.colors.blue} \`Blue\`
${emojis.colors.darkblue} \`Dark blue\`
${emojis.colors.blurple} \`Blurple\`
${emojis.colors.lightpurple} \`Light purple\`
    :yes}
    {field:‎:
${emojis.colors.purple} \`Purple\`
${emojis.colors.darkpurple} \`Dark purple\`
${emojis.colors.pink} \`Pink\`
${emojis.colors.brown} \`Brown\`
${emojis.colors.black} \`Black\`
${emojis.colors.gray} \`Gray\`
${emojis.colors.white} \`White\`
    :yes}
    {thumbnail:https://api.clembs.xyz/other/color/$getGlobalUserVar[color]}
    {color:$getGlobalUserVar[color]}
    ;no]

    $let[title-enUS;CRBT Settings - Accent color]
    $let[description-enUS;**Current color:** \`#$getGlobalUserVar[color]\`
This color is applied across most commands you use on CRBT.\nYou can either choose one of these colors below or use your own [hexadecimal color](https://htmlcolorcodes.com/color-picker/).
You can also use your Discord profile color (if you have any) as your CRBT accent color! Simply use \`$getServerVar[prefix]$commandName profile\`.]
    $let[default-enUS;default]

$else

    $setGlobalUserVar[color;$get[color]]

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {description:$get[description-$getGlobalUserVar[language]]}
    {color:$get[color]}
    ;no]
        
    $let[title-enUS;${emojis.success} Accent color updated]
    $let[description-enUS;$username[$clientID] will now use this color across all commands you execute!]

    $onlyIf[$isValidHex[$get[color]]==true;{execute:notAColor}]

    $if[$replaceText[$toLowercase[$message]; ;]!=profile]

    $let[color;$toLowercase[$replaceText[$replaceText[$checkCondition[$getObjectProperty[colors.$get[message]]!=];true;$getObjectProperty[colors.$get[message]]];false;$get[message]]]]
    $let[message;$replaceText[$replaceText[$toLowercase[$message];#;]; ;]]

    $else

    $let[color;$replaceText[$getObjectProperty[banner_color];#;]]

    $onlyIf[$getObjectProperty[banner_color]!=;{execute:noProfileColor}]

    $createObject[$jsonRequest[https://discordapp.com/api/users/$authorID;;;Authorization:Bot $clientToken]]

    $endif

$endif

$djsEval[const { colors } = require("../../../../../index");
d.object.colors = colors]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}