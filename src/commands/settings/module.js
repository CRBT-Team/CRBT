const {illustrations} = require("../../../index");

module.exports.command = {
    name: "module",
    code: `
$if[$message==]

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

]

$let[title-enUS;CRBT Settings - Dashboard]
    `}