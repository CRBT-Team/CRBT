module.exports.command = {
    name: "qrcode",
    aliases: ['createqr','create-qr','generate-qr','qr-code','qr'],
    module: "tools",
    description_enUS: "Creates a QR-code off the indicated link/image.",
    usage_enUS: "<link | attachment>",
    slashCmd: 'qrcode create link:<args>',
    code: `
$reply[$messageID;
{author:QR-code creation - Result}

{image:https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=$get[message]}

{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$get[message]!=;{execute:args}]

$let[message;$replaceText[$replaceText[$checkCondition[$message==];true;$messageAttachment];false;$message]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}