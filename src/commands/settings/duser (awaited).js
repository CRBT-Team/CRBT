const { links, emojis, illustrations } = require("../../../index");

module.exports.awaitedCommand = {
    name: "duser",
    code: `
$editMessage[$message[1];
    {author:$get[title-$getGlobalUserVar[language]] (User):${illustrations.settings}}

$get[user]
    
    {color:$getGlobalUserVar[color]}
;$channelID]

$let[title-enUS;CRBT Settings - Dashboard]

$let[user;
{field:Language:
Set to English (American) - \`$getGlobalUserVar[language]\`.
Changes $username[$clientID]'s language for when you use it.
Not changeable at the moment.
:no}

{field:Accent color:
Set to \`#$getGlobalUserVar[color]\`.
Changes the color of most embeds for commands you use with CRBT.
Change it with \`$getServerVar[prefix]color\`
:no}

{field:Telemetry:
${emojis.toggle.fon} Enabled
**Note:** Since the August 2021 update, telemetry features can no longer be disabled.
You can read CRBT's privacy policy **[here](${links.privacypolicy})**.
:no}

{thumbnail:https://api.clembs.xyz/other/color/$getGlobalUserVar[color]}
]
    `}