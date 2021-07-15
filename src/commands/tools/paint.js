module.exports.command = {
    name: "paint",
    aliases: ["color", "namepaint"],
    code: `

$djsEval[

if ("$get[role]" === undefined) {

$createRole[$get[color];$get[color];no;no]

$giveRoles[$authorID;$get[role]]

channel.send("debug:\\ncolor:$get[color]\\nrole: $get[role]\\nstat: b")

}

else {

$giveRoles[$authorID;$get[role]]

channel.send("debug:\\ncolor:$get[color]\\nrole: $get[role]\\nstat: a")

}
]

$onlyIf[$isValidHex[$replaceText[$get[color];#;]]==true;not a real color!!! (use hex only for now, # or not idrc)]

$let[role;$replaceText[$replaceText[$checkCondition[$findRole[$get[color]]==];true;undefined];false;$findRole[$get[color]]]]
$let[color;#$replaceText[$toUppercase[$message];#;]]

$argsCheck[1;{execute:args}]
    `}


/*
if ("$get[role]" === "") {

channel.send("painted you in $get[color]")

$giveRoles[$authorID;$findRole[$get[color]]]

$createRole[$get[color];$get[color];no;no]

$onlyIf[$roleCount!=250;role capacity exceeded xd]

}

else {

channel.send("painted you in $get[color]")

$giveRoles[$authorID;$get[role]]

}
*/