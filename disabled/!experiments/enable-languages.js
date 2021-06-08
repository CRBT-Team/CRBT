const { links } = require("../../index");

module.exports.awaitedCommand = {
    name: "enable-languages",
    code: `
$editMessage[$message[1];$if[$getGlobalUserVar[accessibility]==false]
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$clientID;64]}
$else
{title:$get[title-$getGlobalUserVar[language]]}
$endif
{description:$get[description-$getGlobalUserVar[language]]}
{field:$replaceText[$replaceText[$getServerVar[crbtplus];false;CRBT+];true;• CRBT+] (1️⃣):
Enables CRBT+ upsells in certain places and adds the \`CRBT+\` command.
Type: Server experiment (requires the administrator to enable).
$replaceText[$replaceText[$getGlobalUserVar[debug];true;\`#crbtplus-upsells\`];false;]
}
{field:$replaceText[$replaceText[$getGlobalUserVar[languages];false;Languages];true;• Languages] (2️⃣):
Adds an option to change the language CRBT will speak. Available options: enUS, enUK, esES, frFR, ptBR, ru
Type: User experiment.
$replaceText[$replaceText[$getGlobalUserVar[debug];true;\`#enable-languages\`];false;]
}
{field:$replaceText[$replaceText[$getGlobalUserVar[accessibility];false;Accessibility mode];true;• Accessibility mode] (3️⃣):
Makes titles bigger and removes illustrations.
Type: User experiment.
$replaceText[$replaceText[$getGlobalUserVar[debug];true;\`#accessibility-mode\`];false;]
}
{field:$replaceText[$replaceText[$getGlobalUserVar[debug];false;Debug Mode];true;• Debug mode] (4️⃣):
Adds new debugging information in some places.
Type: User experiment.
$replaceText[$replaceText[$getGlobalUserVar[debug];true;\`#debug-mode\`];false;]
}
{color:$getGlobalUserVar[color]}
$if[$getGlobalUserVar[accessibility]==false]
{thumbnail:https://cdn.discordapp.com/attachments/843146398484660254/845240678485327912/unknown.png}
$endif
;$channelID]

$let[title-enUS;$username[$clientID] - Experiments]
$let[description-enUS;Warning: Be aware that you may encounter bugs that may ruin your CRBT experience.
Click on a reaction to toggle the matching experiment.
Intrested in testing cool features early? Join our [Discord server](${links.info.discord})]

$if[$getGlobalUserVar[languages]==false]
$setGlobalUserVar[languages;true]
$else
$setGlobalUserVar[languages;false]
$endif
    `}