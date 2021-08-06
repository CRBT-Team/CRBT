module.exports.command = {
    name: "$alwaysExecute",
    code: `
$reply[$messageID;
{author:$eval[$getObjectProperty[a.title];yes]:$userAvatar[$clientID;64]}
{description:$eval[$getObjectProperty[a.description];yes]}
{color:$getGlobalUserVar[color]}
;no]

$djsEval[
const { $getGlobalUserVar[language] } = require("../../../../../data/translations/basic.json") 
d.object.a = $getGlobalUserVar[language].CRBT
]

$onlyIf[$stringStartsWith[$getGlobalUserVar[lastCmd];prefix ** ]==false;]
$onlyIf[$checkContains[$checkCondition[$message==<@!$clientID>]$checkCondition[$message==<@$clientID>];true]==true;]
    `}