const {illustrations} = require("../../../index");

module.exports.command = {
    name: "module",
    aliases: ["modules", "config", "cfg", "md"],
    usage_enUS: "<enable | + | - | disable (optional)> <module name (optional)>",
    code: `
$if[$message==]

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

{description:
}

;no]


$elseIf[$checkContains[$stringStartsWith[$message;+]$stringStartsWith[$message;enable ];true]==true]

$endelseIf
$elseIf[$checkContains[$stringStartsWith[$message;-]$stringStartsWith[$message;disable ];true]==true]

$endelseIf
$endif

$let[title-enUS;CRBT Settings - Modules]
    `}