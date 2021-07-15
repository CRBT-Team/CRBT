module.exports.command = {
    name: "paint",
    aliases: ["color", "namepaint"],
    code: `
$if[$get[role]!=undefined]

$createRole[$get[color];$get[color];no;no]

$onlyIf[$roleCount!=250;role capacity exceeded xd]

$else

$giveRoles[$authorID;$get[color]]

$endif

$let[role;$findRole[$get[color]]]
$let[color;#$replaceText[$message;#;]]

$argsCheck[1;{execute:args}]
    `}