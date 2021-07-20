const {colors} = require("../../../index");

module.exports.interactionCommand = {
    name: "ephemeral",
    prototype: "button",
    code: `
$interactionReply[;
{title:hello}
{field:Hello:
a
:yes}
{field:Hello:
a
:yes}
{color:${colors.blue}}
;{actionRow:here's a button,2,1,a,,true:oh another one,2,1,e,,true}
;64]
    `}