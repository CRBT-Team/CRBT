const { tokens } = require("../../../index");

module.exports.command = {
    name: "ocr",
    aliases: ["itt", "imagetotext"],
    module: "tools",
    description_enUS: "Retrieves found text inside of an image.",
    usage_enUS: "{image URL/attachement} (language)",
    botperms: [""],
    code: `
    $reply[$messageID;
    {title:OCR}
    {color:$getGlobalUserVar[color]}
    {description:
\`\`\`
$jsonRequest[https://api.ocr.space/parse/imageurl?apikey=${tokens.apis.ocr}&url=$replaceText[$replaceText[$checkCondition[$message==];true;$messageAttachement];false;$message]&scale=true&OCREngine=2;ParsedResults#RIGHT#0#LEFT#.ParsedText]
\`\`\`
    };no]
    

    $argsCheck[0;{execute:args}]
    $onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
    $onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
    $if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
    $setGlobalUserVar[lastCmd;$commandName]
    `
}