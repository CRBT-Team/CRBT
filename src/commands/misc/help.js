const { emojis, logos } = require("../../../index");

module.exports.command = {
    name: "help",
    code: `
$if[$message==]

$else

$reply[$messageID;
{author:$commandInfo[$message;name] - Command info:${logos.CRBTsmall}}

{field:Description:
$replaceText[$commandInfo[$message;description_$getGlobalUserVar[language]];<botname>;$username[$clientID]]
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
$replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;${emojis.general.toggleon}];false;${emojis.general.toggleoff}] $toLocaleUppercase[$commandInfo[$message;module]]
:yes}

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

$endif

    `}