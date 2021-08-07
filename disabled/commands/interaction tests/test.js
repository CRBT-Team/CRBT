const {colors} = require("../../../index");

module.exports.command = {
    name: "test",
    code: `
$apiMessage[;
{title:Button tests}
{field:Hello:
a
:yes}
{field:Hello:
a
:yes}
{color:${colors.default}}
;{actionRow:ephemeral message,2,1,ephemeral:edit message,2,3,edit:link,2,5,https\\://clembs.xyz:load,2,4,load}
{actionRow:second row,2,1,a,,true:that does nothing,2,1,e,,false}
;$messageID:false;no]
    `}