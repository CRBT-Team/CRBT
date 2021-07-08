const { emojis, logos } = require("../../../index");

module.exports.command = {
    name: "help",
    description_enUS: "eeeeeeeeeeee",
    usage_enUS: "<command name | module name (optional)>",
    module: "misc",
    aliases: ["aled"],
    code: `
$if[$message==]

$reply[$messageID;
{author:CRBT - Help}

{description:
use the other bot lol
}

;no]



$else

$reply[$messageID;
{author:$commandInfo[$message;name] - Command info:${logos.CRBTsmall}}
{field:Description:
$replaceText[$replaceText[$checkCondition[$commandInfo[$message;description_$getGlobalUserVar[language]]!=];true;$replaceText[$replaceText[$commandInfo[$message;description_$getGlobalUserVar[language]];<botname>;$username[$clientID]];<prefix>;$getServerVar[prefix]]];false;No description available, please \`$getServerVar[prefix]report\` this as an issue.]
:no}
{field:Usage:
\`\`\`
$replaceText[$replaceText[$getServerVar[prefix]$commandInfo[$message;name];$getServerVar[prefix]m/;m/];$getServerVar[prefix]=;=] $replaceText[$commandInfo[$message;usage_$getGlobalUserVar[language]];<botname>;$username[$clientID]]\`\`\`
:no}
{field:Aliases:
\`\`\`
$replaceText[$commandInfo[$message;aliases];,;, ]\`\`\`
:no}
{field:Permission errors:
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$get[botPerms]/$get[userPerms]
;true/true;${emojis.general.success} You're all set to use this command!]
;false/true;**$username[$clientID]** may need the $toUppercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;true/false;You may need the $toUppercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions]
;false/false;You may need the $toUppercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions, and **$username[$clientID]** may need the $toUppercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;/true;${emojis.general.success} You're all set to use this command!]
;true/;${emojis.general.success} You're all set to use this command!]
;false/;**$username[$clientID]** may need the $toUppercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;false/;You may need the $toUppercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions]
:no}
{field:Cooldown:
$replaceText[$replaceText[$checkCondition[$commandInfo[$message;cooldown]==];true;None];false;$commandInfo[$message;cooldown]]
:yes}
{field:Module:
$replaceText[$replaceText[$checkContains[$commandInfo[$message;module];misc;settings];false;$replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;${emojis.general.toggleon}];false;${emojis.general.toggleoff}] $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;Use \`$getServerVar[prefix]module $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;-];false;+]$commandInfo[$message;module]\` to $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] this module.];false;]];true;${emojis.general.forcedon} $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;\`You can't disable this module.\`];false;]]
:$replaceText[$replaceText[$hasPerms[$authorID;admin];true;no];false;yes]}
{color:$getGlobalUserVar[color]}
;no]

    $if[$commandInfo[$message;userPerms]!=]
        $let[userPerms;$hasPerms[$authorID;$joinSplitText[;]]]
        $textSplit[$replaceText[$commandInfo[$message;userPerms];,;@@];@@]
    $else
        $let[userPerms;true]
    $endif

    $if[$commandInfo[$message;botPerms]!=]
        $let[botPerms;$hasPerms[$clientID;$joinSplitText[;]]]
        $textSplit[$replaceText[$commandInfo[$message;botPerms];,;@@];@@]
    $else
        $let[botPerms;true]
    $endif

$onlyIf[$commandInfo[$message;module]!=;{execute:cmdDoesntExist}]

$endif

    `}