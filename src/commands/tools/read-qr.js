module.exports.command = {
    name: "readqr",
    aliases: ['createqr','create-qr','generate-qr','qr-code','qr'],
    module: "tools",
    description_enUS: "Scans the given QR-code and gives the parsed text.",
    usage_enUS: "<image URL | attachment>",
    code: `
$reply[$messageID;
{author:QR-code scan - Results}

{field:Parsed text:
$getObjectProperty[[0].symbol[0].data]
:yes}

{color:$getGlobalUserVar[color]}
;no]

$createObject[$jsonRequest[http://api.qrserver.com/v1/read-qr-code/?fileurl=$get[message]]]

$onlyIf[$get[message]!=;{execute:args}]

$let[message;$replaceText[$replaceText[$checkCondition[$message==];true;$messageAttachment];false;$message]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}