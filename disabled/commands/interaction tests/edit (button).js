const {colors} = require("../../../index");

module.exports.interactionCommand = {
    name: "edit",
    prototype: "button",
    code: `
$interactionReply[;
{title:Oh no i'm edited}
{color:${colors.blue}}
;{actionRow:ephemeral message,2,1,ephemeral:edit message,2,3,edit:link,2,5,https\\://clembs.xyz:load,2,4,load}
{actionRow:second row,2,1,a,,true:that does nothing,2,1,e,,false}
;;7]
    `}