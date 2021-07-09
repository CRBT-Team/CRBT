const {illustrations} = require("../../../index");

module.exports.command = {
    name: "dashboard",
    aliases: ["settings","set", "setting", "options"],
    module: "settings",
    description_enUS: "Shows a complete overview of CRBT's settings for you and the server.",
    usage_enUS: "<user | server (optional)>",
    code: `
$if[$message==]

    $if[$hasPermsInChannel[$channelID;$clientID;addreactions]==true]
        $reactionCollector[$botLastMessageID;$authorID;12m;⚙️,👥;servset;userset;yes]
    $endif

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

    $if[$hasPermsInChannel[$channelID;$clientID;addreactions]==true]
        {description:$get[desc1-$getGlobalUserVar[language]]}
    $else
        {description:$get[desc2-$getGlobalUserVar[language]]}
    $endif

{field:Prefix:
Set to \`$getServerVar[prefix]\`. (default: \`$getVar[prefix]\`)
Changes $username[$clientID]'s prefix across all commands.
Changeable with \`$getServerVar[prefix]prefix $commandInfo[prefix;usage_$getGlobalUserVar[language]]\`.
:no}

{field:Volume:
Set to \`$getServerVar[volume]%\`
Changes the volume of the music playback.
Changeable with \`$getServerVar[prefix]volume $commandInfo[vol;usage_$getGlobalUserVar[language]]\`
:no}

{field:Muted role:
$replaceText[$replaceText[$checkCondition[$getServerVar[muted_role]==];false;Set to <@&$getServerVar[muted_role]>];true;None was set yet].
Changes the role given to a user muted with the \`$getServerVar[prefix]mute\` command.
Changeable with \`$getServerVar[prefix]mutedrole $commandInfo[mutedrole;usage_$getGlobalUserVar[language]]\`
:no}

    {color:$getGlobalUserVar[color]}
    ;no]

$elseIf[$toLowercase[$message]==server]

    $if[$hasPermsInChannel[$channelID;$clientID;addreactions]==true]
        $reactionCollector[$botLastMessageID;$authorID;12m;⚙️,👥;servset;userset;yes]
    $endif

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

    $if[$hasPermsInChannel[$channelID;$clientID;addreactions]==true]
    {description:$get[desc1-$getGlobalUserVar[language]]}
    $else
    {description:$get[desc2-$getGlobalUserVar[language]]}
    $endif

    {field:Prefix:
Set to \`$getServerVar[prefix]\`. (default: \`$getVar[prefix]\`)
Changes $username[$clientID]'s prefix across all commands.
Changeable with \`$getServerVar[prefix]prefix $commandInfo[prefix;usage_$getGlobalUserVar[language]]\`.
    :no}

    {field:Volume:
Set to \`$getServerVar[volume]%\`
Changes the volume of the music playback.
Changeable with \`$getServerVar[prefix]volume $commandInfo[vol;usage_$getGlobalUserVar[language]]\`
    :no}

    {field:Muted role:
$replaceText[$replaceText[$checkCondition[$getServerVar[muted_role]==];false;Set to <@&$getServerVar[muted_role]>];true;None was set yet].
Changes the role given to a user muted with the \`$getServerVar[prefix]mute\` command.
Changeable with \`$getServerVar[prefix]mutedrole $commandInfo[mutedrole;usage_$getGlobalUserVar[language]]\`
    :no}

    {color:$getGlobalUserVar[color]}
    ;no]
$endelseIf
$elseIf[$toLowercase[$message]==user]

    $if[$hasPermsInChannel[$channelID;$clientID;addreactions]==true]
        $reactionCollector[$botLastMessageID;$authorID;12m;⚙️,👥;servset;userset;yes]
    $endif

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

    $if[$hasPermsInChannel[$channelID;$clientID;addreactions]==true]
    {description:$get[desc1-$getGlobalUserVar[language]]}
    $else
    {description:$get[desc2-$getGlobalUserVar[language]]}
    $endif

    {field:Prefix:
    Set to \`$getServerVar[prefix]\`. (default: \`$getVar[prefix]\`)
    Changes $username[$clientID]'s prefix across all commands.
    Changeable with \`$getServerVar[prefix]prefix $commandInfo[prefix;usage_$getGlobalUserVar[language]]\`.
    :no}

    {field:Volume:
    Set to \`$getServerVar[volume]%\`
    Changes the volume of the music playback.
    Changeable with \`$getServerVar[prefix]volume $commandInfo[vol;usage_$getGlobalUserVar[language]]\`
    :no}

    {field:Muted role:
    $replaceText[$replaceText[$checkCondition[$getServerVar[muted_role]==];false;Set to <@&$getServerVar[muted_role]>];true;None was set yet].
    Changes the role given to a user muted with the \`$getServerVar[prefix]mute\` command.
    Changeable with \`$getServerVar[prefix]mutedrole $commandInfo[mutedrole;usage_$getGlobalUserVar[language]]\`
    :no}

    {color:$getGlobalUserVar[color]}
;no]
$endelseIf
$else
    $loop[1;args]
$endif

$let[title-enUS;CRBT Settings - Dashboard]
$let[desc1-enUS;Add a corresponding reaction to the message to switch between menus.\n**Index:** ⚙️ Server Settings | 👥 User Settings]
$let[desc2-enUS;To switch to User Settings, you can use \`$getServerVar[prefix]dashboard user\`]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}