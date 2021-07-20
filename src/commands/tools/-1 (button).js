const {colors} = require("../../../index");

module.exports.interactionCommand = {
    name: "minus",
    prototype: "button",
    code: `
$interactionReply[;
{title:Counter: $math[$get[num]-1]}
{color:${colors.red}}
;{actionRow:+1,2,3,plus:-1,2,4,minus}
;;7]

$let[num;$replaceText[$getEmbed[$channelID;$getUserVar[lastCmd;$clientID];title];Counter: ;]]
    `}