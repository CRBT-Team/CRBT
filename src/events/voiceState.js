const { dev, misc } = require('../..')

const voice = !dev ? '774555883648057344' : '844903091669303296';
const voice_text = !dev ? '832743385344770070' : '903996964214022206'

module.exports.voiceStateUpdateCommand = { 
  channel: misc.channels.telemetry,
  code: `
$modifyChannelPerms[${voice_text};$get[isNew]viewchannel;$newState[id]]

<@!$newState[id]> $replaceText[$replaceText[$get[isNew];+;joined];-;left] <#${voice}>

$let[isNew;$replaceText[$replaceText[$checkCondition[$newState[channelID]==${voice}];true;+];false;-]]

$onlyIf[$checkContains[$newState[channelID]$oldState[channelID];${voice}]==true;]
  `}