const {emojis,colors} = require("../../../index");

module.exports.command = {
    name: "calc",
    module: "tools",
    aliases: ["=", "math", "calculate"],
    description_enUS: "Calculates your input.",
    usage_enUS: "<math calculation (e.g. 4+3)>",
    code: `
$reply[$messageID;
{title:$getObjectProperty[math]}
{color:$replaceText[$replaceText[$checkContains[$toLowercase[$getObjectProperty[math]];an error occured];false;$getGlobalUserVar[color]];true;${colors.error}]}
;no]

$djsEval[const { Parser } = require('expr-eval');
const math = new Parser();
try{
    d.object.math = "= " + math.evaluate('$get[calc]')
}
catch(err) {
    d.object.math = "${emojis.error} An error occured...}\\n{description:\`" + err.message + "\`"
}
]

$let[calc;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;x;*];#COLON#;/]; ;];,;];\n;\\n]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}

/*
$onlyIf[$isNumber[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;+;];-;];x;];*;];/;];);];(;]]==true;{execute:args}]
     */