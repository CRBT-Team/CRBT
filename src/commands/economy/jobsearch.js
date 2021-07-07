module.exports.command = {
    name: "jobsearch",
    code: `
yo you got:
**$get[random1]**, **$get[random2]** and **$get[random3]**!
this is a wip command, for now you can't have a job
btw if this ever f*cks up, dont ping clembs, just ()report the command (check if it hasnt been reported)

$let[random3;$randomText[$joinSplitText[;]]]
$textSplit[$get[pool3];|]
$let[pool3;$replaceText[$get[pool2];$replaceText[$replaceText[$checkCondition[$get[random2]==policeman];true;|$get[random2]];false;$get[random2]|];]]
$let[random2;$randomText[$joinSplitText[;]]]
$textSplit[$get[pool2];|]
$let[pool2;$replaceText[$get[pool1];$replaceText[$replaceText[$checkCondition[$get[random1]==policeman];true;|$get[random1]];false;$get[random1]|];]]
$let[random1;$randomText[$joinSplitText[;]]]
$textSplit[$get[pool1];|]
$let[pool1;farmer|cashier|musician|youtuber|mcdoemployee|pornstar|gardener|prostitute|developer|doctor|illustrator|policeman]
    `}