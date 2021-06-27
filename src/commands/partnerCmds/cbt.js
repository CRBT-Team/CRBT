const { botinfo, links } = require("../../../index");

module.exports.command = {
    name: "cbt",
    aliases: ["cbti", "cbtinfo"],
    description_enUS: "give cool info about cock and ball torture bot",
    module: "partnerCmd",
    server: "782584672298729473",
    code: `
$reply[$messageID;  
  {author:$get[title]:$userAvatar[$clientID;64]}

  {description:
  $get[description]
  }

  {field:$get[members]:yes}

  {field:$get[servers]:yes}

  {field:$get[creationDate]:yes}

  {field:$get[ping]:yes}

  {field:$get[uptime]:yes}

  {field:$get[computer]:yes}

  {thumbnail:https://cdn.discordapp.com/emojis/567094827179704330.png?size=4096}

  {color:$getGlobalUserVar[color]}
;no]

$let[title;cbt - Information]
$let[description;**[Website](https://en.wikipedia.org/wiki/Cock_and_ball_torture)** | **[Add to Discord](${links.invite})** | **[Support server](${links.info.discord})** | **[Vote on top.gg](${links.vote.topgg})**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Created by **[sexmaster](https://clembs.xyz/)**]
$let[members;memebers:big number]
$let[servers;servers:a lot???]
$let[creationDate;Created at:a long time ago, probably]
$let[ping;help idk what any of these numbers mean: $pingms\n$replaceText[$getObjectProperty[final];-;]ms\$dbPingms]
$let[uptime;since when is crbt not ded chat xd: $getObjectProperty[uptime]]
$let[computer;the pc: disk#COLON# $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] gb/s\nram#COLON# $ram mb\ncpu#COLON# $cpu%\nhosted by [your mom](https://kiwatech.net/)]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$onlyForServers[$commandInfo[$commandName;server];]
    `}