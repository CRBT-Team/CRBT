module.exports.command = {
    name: "pick",
    module: "tools",
    aliases: ["choose", "random", "sack"],
    description_enUS: "Picks something from the given values at random.",
    usage_enUS: "<values (separate with commas or newlines) (2 minimum)> <comment (seperated with //) (optional)>",
    examples_enUS: [
        "pick strawberry, vanilla, chocolate // what ice cream tastes better?",
        "pick watch more shows\\nsleep",
        "choose Larry, Barry"
    ],
    code: `
$reply[$messageID;
$if[$checkContains[$message; // ]==true]
{author:Comment∶ "$replaceText[$replaceText[$checkCondition[$charCount[$getObjectProperty[comment]]>35];true;$cropText[$getObjectProperty[comment];35]...];false;$getObjectProperty[comment]]"}
$endif
{title:"$get[random]" was picked from $getTextSplitLength values.}
$if[$checkContains[$message; // ]==false]
{description:**New:** You can now add comments to spice up your selections. Simply add a comment with \` // comment\` next to your list of values!}
$endif
{color:$getGlobalUserVar[color]}
;no]

$let[random;$randomText[$joinSplitText[;]]]

$onlyIf[$getTextSplitLength>=2;{execute:args}]

$textSplit[$get[options];$get[key]]

$if[$checkContains[$message; // ]==true]

$let[options;$replaceText[$replaceText[$replaceText[$splitText[1];\n;, ];, ;,];,;$get[key]]]

$djsEval[
const { Util } = require("discord.js");
d.object.comment = Util.cleanContent("$get[comment]", message);]
$let[comment;$splitText[2]]
$textSplit[$message; // ]

$else

$let[options;$replaceText[$replaceText[$replaceText[$message;\n;, ];, ;,];,;$get[key]]]

$endif

$let[key;$randomString[10]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}