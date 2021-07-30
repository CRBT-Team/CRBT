module.exports.command = {
    name: "rule34",
    aliases: ["r34"],
    description_enUS: "Gives an random post from rule34.xxx containing the specified tags.",
    module: "nsfw",
    usage_enUS: "<tags (separated with a comma)>",
    code: `
$reply[$messageID;
{author:Rule 34 - Results:https://cdn.clembs.xyz/6E55isu.png}
{description:
**[View original]($getObjectProperty[r.sample_url])** | **[Open in Rule34.xxx](https://rule34.xxx/index.php?page=post&s=view&id=$getObjectProperty[r.id])**$replaceText[$replaceText[$checkCondition[$getObjectProperty[r.source]==];true;];false; | **[Source]($getObjectProperty[r.source])**]$replaceText[$replaceText[$checkCondition[$getObjectProperty[r.creator_url]==];true;];false; | **[Creator URL]($getObjectProperty[r.creator_url])**]
}
{field:Tags:
\`\`\`
$replaceText[$getObjectProperty[r.tags];,;, ]\`\`\`
:no}

{field:Created on:
<t:$formatDate[$getObjectProperty[r.created_at];X]> (<t:$formatDate[$getObjectProperty[r.created_at];X]:R>)
:yes}

{image:$getObjectProperty[r.sample_url]}
{color:$getGlobalUserVar[color]}
;no]

$djsEval[
let req = $get[req]

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

let num = randInt(0, req.length)

d.object.r = req[num]
]

$onlyIf[$get[req]!=#RIGHT##LEFT#;{execute:queryNotFound}]

$let[req;$jsonRequest[https://r34-json-api.herokuapp.com/posts?tags=$get[query]]]

$if[$message==]

$let[query;$getGlobalUserVar[r34Query]]
$onlyIf[$getGlobalUserVar[r34Query]!=]

$else

$setGlobalUserVar[r34Query;$get[query]]
$let[query;$replaceText[$replaceText[$replaceText[$toLowercase[$message]; ;_];,_;+];#colon#;#COLON#]]

$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyNSFW[{execute:nsfw}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}

// $reactionCollector[$botLastMessageID;$authorID;10m;${emojis.music.loop};shufflensfw;yes]