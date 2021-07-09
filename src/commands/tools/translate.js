module.exports.command = {
    name: "tr",
    code: `
$reply[$messageID;
{author:Translation - Results}
{field:$getObjectProperty[lang.enUS.$toLowercase[$getObjectProperty[given.lang]]]:
\`\`\`text
$messageSlice[1]
\`\`\`
:no}
{field:$getObjectProperty[lang.enUS.$toLowercase[$getObjectProperty[translated.lang]]]:
\`\`\`text
$getObjectProperty[translated.text]
\`\`\`
:no}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[>1;{execute:args}]

$djsEval[const { languages } = require("../../../../../json/api.json");
d.object.lang = languages;]

$createObject[$jsonRequest[https://translate-api.ml/translate?text=$uri[encode;$messageSlice[1]]&lang=$message[1]]]
$onlyIf[$botOwnerID==$authorID;{execute:owneronly}]
    `}