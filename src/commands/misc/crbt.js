const { links } = require("../../../index");

module.exports.command = {
    name: "info",
    module: "misc",
    aliases: ["crbti", "crbt", "bi", "botinfo", "bot-info", "bot_info", "crbt-info", "crbt_info", "stats", "crbtinfo"],
    description_enUS: "Gives detailed information and news about <botname>.",
    description_enUK: "Sends detailed information and the latest news of <botname>",
    description_frFR: "Présente des informations détaillées et actualités sur <botname>.",
    description_ru: "Даёт подробную информацию и новости о <botname>",
    code: `
$reply[$messageID;  
    {author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$clientID;64]}

    {description:
    $get[description-$getGlobalUserVar[language]]
    }

    {field:$get[members-$getGlobalUserVar[language]]:yes}

    {field:$get[servers-$getGlobalUserVar[language]]:yes}

    {field:$get[creationDate-$getGlobalUserVar[language]]:yes}

    {field:$get[ping-$getGlobalUserVar[language]]:yes}

    {field:$get[uptime-$getGlobalUserVar[language]]:yes}

    {field:$get[computer-$getGlobalUserVar[language]]:yes}

    {thumbnail:$userAvatar[$clientID;512]}

    {color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$userTag[$clientID] - Information]
$let[description-enUS;**[Website](${links.baseURL})** | **[Add to Discord](${links.invite})** | **[Support server](${links.info.discord})** | **[Vote on top.gg](${links.vote.topgg})**]
$let[members-enUS;Members:$numberSeparator[$allMembersCount]]
$let[servers-enUS;Servers:$numberSeparator[$serverCount]]
$let[creationDate-enUS;Created on:<t:$formatDate[$creationDate[$clientID;date];X]> (<t:$formatDate[$creationDate[$clientID;date];X]:R>)]
$let[ping-enUS;Ping: Message: $pingms\nWebSocket: $botPingms\nDatabase: $dbPingms]
$let[uptime-enUS;Uptime: $getObjectProperty[uptime]]
$let[computer-enUS;Server: Disk speed: $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] GB/s\nRAM: $ram MB\nCPU: $cpu%\nHosted on $replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;$username[$botOwnerID]'s $replaceText[$replaceText[$djsEval[require("os").platform();yes];win32;Windows PC];linux;Linux PC]];true;Club Hosting]]

$djsEval[const tools = require('dbd.js-utils')
let theUptimeInMS = tools.parseToMS("$replaceText[$uptime; ;]")
d.object.uptime = tools.parseMS(theUptimeInMS)]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}