module.exports.command = {
    name: "paint",
    aliases: ["color", "namepaint"],
    code: `
$if[$get[role]==undefined]

$giveRoles[$authorID;$findRole[$get[color]]]

$wait[1s]

$createRole[$get[color];$get[color];no;no]

debug:\ncolor:$get[color]\nrole: $get[role]\nstat: b"

$else

$giveRoles[$authorID;$get[role]]

debug:\ncolor:$get[color]\nrole: $get[role]\nstat: a

$endif

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