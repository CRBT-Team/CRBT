const { emojis } = require("../../../index");

module.exports.command = {
    name: "shuffletext",
    module: "fun",
    aliases: ["shf", "textshuffle"," shufflet"],
    description_enUS: "Shuffles words in a given text.",
    usage_enUS: "<text>",
    code: `
$reply[$messageID;
{title:$getObjectProperty[shuffle]}
{color:$getGlobalUserVar[color]}
;no]

$djsEval[
Array.prototype.shuffle = function() {
    var i = this.length;
    if (i == 0) return this;
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1 ));
        var a = this[i];
        var b = this[j];
        this[i] = b;
        this[j] = a;
    }
    return this;
};

var s = "$get[message]"
var shuffledSentence = s.split(' ').shuffle().join(' ');

d.object.shuffle = shuffledSentence

$let[message;$replaceText[$replaceText[$message;\n;\\n];";']]

$argsCheck[>2;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}