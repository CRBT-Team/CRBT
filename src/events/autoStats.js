const { misc, dev, colors } = require('../..');
const { version, versionName } = require("../../package.json");

module.exports.loopCommand = {
    channel: `${misc.channels.statsDev}`,
    executeOnStartup: true,
    every: 60000,
    code: `
$editMessage[$replaceText[$replaceText[${!dev};true;${misc.channels.statsMsg}];false;${misc.channels.statsMsgDev}];
FYI: The footer should read your computer's time. If it doesn't, $username[$clientID] is offline.
$replaceText[$replaceText[${!dev};true;Ping <@!$botOwnerID> or <@!244905301059436545> (if Clembs is offline only) if that's the case.];false;Do NOT ping Clembs or dave if that's the case. Remember, this is a development bot. Check <#${misc.channels.stats}> for CRBT's stats.]
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
{field:Latency:
▪︎ Message: $round[$math[$ping/3]]ms
▪︎ Database: $dbPingms
:yes}
{field:Server:
▪︎ CPU: $cpu%
▪︎ RAM: $roundTenth[$ram;2] MB
▪︎ Disk: $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] GB/s
$if[${!dev}==true]
Hosted on $username[$botOwnerID]'s PC
$endif
:yes}
{field:Bot:
▪︎ Version ${version} (${versionName})
▪︎ Node.js $nodeVersion
▪︎ Aoi.js v$packageVersion
:yes}
{field:Online since:
<t:$get[up]> (<t:$get[up]:R>)
:yes}
{footer:Last updated}
{timestamp}
{color:$replaceText[$replaceText[${!dev};true;${colors.default}];false;${colors.lightblue}]}
;$replaceText[$replaceText[${!dev};true;${misc.channels.stats}];false;${misc.channels.statsDev}]]

$let[up;$round[$formatDate[$math[$dateStamp-$getObjectProperty[ms]];X]]]

$if[$uptime!=]
$djsEval[const tools = require('dbd.js-utils')
let theUptimeInMS = tools.parseToMS("$replaceText[$uptime; ;]")
d.object.uptime = tools.parseMS(theUptimeInMS)
d.object.ms = theUptimeInMS]
$else
$djsEval[d.object.ms = "0"]
$endif

$onlyIf[$checkContains[$clientID;859369676140314624;${misc.CRBTid}]==true;]
    `}