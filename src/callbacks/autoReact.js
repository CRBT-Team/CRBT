const { emojis, items } = require("../../index");
const b = items.badges
const e = emojis.other

module.exports.command = {
    name: "$alwaysExecute",
    code: `
$if[$checkContains[$toLowercase[$message];énorme]==true]
  $djsEval[message.react('$get[énorme]')]
$endif

$if[$checkContains[$checkContains[$toLowercase[$message];good meal; yum ;yummy;delicious;great meal;goodmeal;good lunch;good_meal;tasty;deliciouse]$checkCondition[$checkContains[$toLowercase[$message];good;very good;veri good;great;tasty;tasti;top quality;gr8]$checkContains[$toLowercase[$message];meal;lunch]==truetrue];true]==true]
  $djsEval[message.react('$get[goodmeal]')]
$endif

$if[$checkContains[$checkCondition[$toLowercase[$message]==cool]$checkContains[$toLowercase[$message];coolwoah;cool ;woah;wow ];true]==true]
  $djsEval[message.react('$get[coolwoah]')]
$endif

$if[$checkContains[$toLowercase[$message];kill yourself;end my life;kill me;i want die;i want aliven't;kys;fml]==true]
  $djsEval[message.react('$get[nodont]')]
$endif

$if[$checkContains[$toLowercase[$message];good bot;best bot]$checkContains[$toLowercase[$message];crbt]==truetrue]
  $djsEval[message.react('$get[heart]')]
$endif

$let[énorme;$replaceText[$replaceText[$get[con];true;<:enorme:738807762988957786>];false;👍]]
$let[heart;$replaceText[$replaceText[$get[con];true;$randomText[${e.heart};💚;${e.coolwoah};👍;🥰]];false;💚]]
$let[coolwoah;$replaceText[$replaceText[$get[con];true;$randomText[${e.coolwoah};😎]];false;😎]]
$let[nodont;❌]
$let[goodmeal;$replaceText[$replaceText[$get[con];true;${e.goodmeal}];false;😋]]

$let[con;$checkCondition[$clientID==595731552709771264]]

$onlyIf[$isBot[$authorID]==false;]
$if[$channelType!=dm] 
  $onlyIf[$hasPermsInChannel[$channelID;$clientID;addreactions]==true;] 
$endif
$onlyIf[$getGlobalUserVar[blocklisted]==false;]
$onlyIf[$getServerVar[module_autoreact]==true;]
$onlyIf[$userExists[$authorID]==true;]
    `}