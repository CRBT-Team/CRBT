const {colors} = require("../../../index");

module.exports.interactionCommand = {
    name: "rock",
    prototype: "button",
    code: `
$interactionReply[;
{title:Rock Paper Scissors}
{description:
You choose $toLocaleUppercase[$get[choice]] and I choose $toLocaleUppercase[$get[rng]]!
$get[$replaceText[$get[result];\n;]]
}
{color:$replaceText[$replaceText[$replaceText[$get[result];win;${colors.green}];loss;${colors.green}];tie;${colors.orange}]}
;;;7]


$let[result;
$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[
$get[choice]-$get[rng]
;paper-scissors;win]
;paper-paper;tie]
;paper-rock;loss]
;scissors-scissors;tie]
;scissors-paper;loss]
;scissors-rock;win]
;rock-scissors;loss]
;rock-paper;win]
;rock-rock;tie]
]

$let[loss;$randomText[UGH this game is rigged.;Looks like you won...;Dang it! We should rematch, I wasn't prepared]]

$let[tie;$randomText[Ugh, that's a tie.;Well, that's a tie.;Neither of us have won...]]

$let[win;$randomText[Too easy... I won 😎;Heck yeah, I won;The RNG is going pretty well on me apparently...]]

$let[choice;rock]
$let[rng;$randomText[paper;rock;scissors]]

$deleteUserVar[temp3;$clientID]
$onlyIf[$getUserVar[temp3;$clientID]==$authorID;]
    `}