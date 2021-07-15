const {emojis,colors} = require("../../../index");

module.exports.command = {
    name: "=",
    nonPrefixed: true,
    module: "tools",
    description_enUS: "Calculates your input.",
    usage_enUS: "<math calculation (e.g. 4+3)>",
    code: `
$reply[$messageID;
{title:$getObjectProperty[math]}
{color:$replaceText[$replaceText[$checkContains[$toLowercase[$getObjectProperty[math]];an error occured];false;$getGlobalUserVar[color]];true;${colors.error}]}
;no]

$onlyIf[$getObjectProperty[math]!=;]

$djsEval[const { Parser } = require('expr-eval');
const math = new Parser();
try{
    d.object.math = "= " + math.evaluate('$get[calc]')
}
catch(err) {
    d.object.math = ""
}
]

$let[calc;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;x;*];#COLON#;/]; ;];,;];\n;\\n]]

$suppressErrors
$argsCheck[>1;]
$onlyIf[$getGlobalUserVar[blocklisted]==false;]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}