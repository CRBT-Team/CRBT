const { links, logos, colors } = require("../../index");
const { version } = require("../../package.json");

module.exports.loopCommand = {
    channel: `${links.channels.statsDev}`,
    executeOnStartup: true,
    every: 60000,
    code: `
$editMessage[$replaceText[$replaceText[$checkCondition[$clientID==${links.CRBTid}];true;${links.channels.statsMsg}];false;${links.channels.statsMsgDev}];
FYI: The footer should read your computer's time. If it doesn't, $username[$clientID] is offline.
$replaceText[$replaceText[$checkCondition[$clientID==${links.CRBTid}];true;Ping <@!$botOwnerID> or <@!244905301059436545> (if Clembs is offline only) if that's the case.];false;Do NOT ping Clembs or dave if that's the case. Remember, this is a development bot. Check <#${links.channels.stats}> for CRBT's stats.]
{author:$username[$clientID] - Stats:$userAvatar[$clientID;64]}
{field:Servers:
$numberSeparator[$serverCount]
:yes}
{field:Members:
$numberSeparator[$allMembersCount]
:yes}
{field:Channels:
$numberSeparator[$allChannelsCount]
:yes}
{field:Ping:
▪︎ Message: $round[$math[$ping/3]]ms
▪︎ Database: $dbPingms
:yes}
{field:Server:
▪︎ CPU: $cpu%
▪︎ RAM: $roundTenth[$ram;2] MB
▪︎ Disk: $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] GB/s
Hosted on $replaceText[$replaceText[$checkCondition[$clientID==${links.CRBTid}];false;$username[$botOwnerID]'s $replaceText[$replaceText[$djsEval[require("os").platform();yes];win32;Windows PC];linux;Linux PC]];true;the Club]
:yes}
{field:Bot:
▪︎ Running NodeJS $nodeVersion
▪︎ Running API at **[api.clembs.xyz](https://api.clembs.xyz)**
▪︎ Running CRBT build ${version}
:yes}
{field:Online since:
<t:$get[up]> (<t:$get[up]:R>)
:yes}
{footer:Last updated}
{timestamp}
{color:$replaceText[$replaceText[$checkCondition[$clientID==${links.CRBTid}];true;${colors.default}];false;${colors.lightblue}]}
;$replaceText[$replaceText[$checkCondition[$clientID==${links.CRBTid}];true;${links.channels.stats}];false;${links.channels.statsDev}]]

$let[up;$round[$formatDate[$math[$dateStamp-$getObjectProperty[ms]];X]]]

$if[$uptime!=]
$djsEval[const tools = require('dbd.js-utils')
let theUptimeInMS = tools.parseToMS("$replaceText[$uptime; ;]")
d.object.uptime = tools.parseMS(theUptimeInMS)
d.object.ms = theUptimeInMS]
$else
$djsEval[d.object.ms = "0"]
$endif
    `}