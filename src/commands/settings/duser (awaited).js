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
:flag_us: Set to English (American) - \`$getGlobalUserVar[language]\`.
Changes $username[$clientID]'s language for when you use it.
Not changeable at the moment.
:no}

{field:Accent color:
Set to #$getGlobalUserVar[color].
Changes the color of most embeds for commands you use with CRBT.
Chnage it with \`$getServerVar[prefix]color\`
:no}

{field:Experimental features:
$replaceText[$replaceText[$getGlobalUserVar[experimentalFeatures];false;${emojis.toggleoff} Disabled];true;${emojis.toggleon} Enabled]
Enables or disables a set of unstable beta commands.
Toggle them with \`$getServerVar[prefix]experiments <"on" | "off">\`
:no}

{field:Telemetry:
${emojis.forcedon} Enabled
**Update:** As of August 2021, telemetry can no longer be disabled.
Learn more about CRBT's privacy policy **[here](${links.privacypolicy})** or use \`$getServerVar[prefix]data\`
:no}
{field:More Settings coming soon!:
CRBT is constantly evolving and we want to provide you the right options.
Soon you'll be able to change CRBT's language, disable command suggestions, and more to make CRBT more personal.
:no}

]
    `}