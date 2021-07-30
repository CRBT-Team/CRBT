const {illustrations} = require("../../../index");

module.exports.command = {
    name: "dashboard",
    aliases: ["settings","set", "setting", "options"],
    module: "settings",
    description_enUS: "Shows a complete overview of CRBT's settings for you and the server.",
    usage_enUS: "<user | server (optional)>",
    code: `
$if[$message==]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

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

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

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

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

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

$argsCheck[<2;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}