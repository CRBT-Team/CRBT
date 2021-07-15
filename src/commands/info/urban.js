const {emojis} = require("../../../index");

module.exports.command = {
    name: "urbandictionary",
    aliases: ["urban", "urbansearch", "urban-search", "urban_search","urban-dictionnary", "urban_dictionnary", "urbandefine"],
    description_enUS: "Searches your query on Urban Dictionnary and gives the first result.",
    module: "info",
    usage_enUS: "<search terms>",
    code: `
$reply[$messageID;
{author:$getObjectProperty[list[0].word] - Urban Dictionary definition:https://cdn.clembs.xyz/VWRSZiW.png}

{description:
**[Open in Urban Dictionary]($getObjectProperty[list[0].permalink])**
}

{field:Definition:
$replaceText[$replaceText[$checkCondition[$charCount[$getObjectProperty[list[0].definition]]>500];true;$cropText[$replaceText[$replaceText[$getObjectProperty[list[0].definition];#RIGHT#;];#LEFT#;];500]...];false;$replaceText[$replaceText[$getObjectProperty[list[0].definition];#RIGHT#;];#LEFT#;]]
:no}

{field:Example:
$replaceText[$replaceText[$checkCondition[$charCount[$getObjectProperty[list[0].example]]>500];true;$cropText[$replaceText[$replaceText[$getObjectProperty[list[0].example];#RIGHT#;];#LEFT#;];500]...];false;$replaceText[$replaceText[$getObjectProperty[list[0].example];#RIGHT#;];#LEFT#;]]
:no}

{field:Author:
**[$getObjectProperty[list[0].author]](https://www.urbandictionary.com/author.php?author=$getObjectProperty[list[0].author])**
:yes}

{field:Written:
<t:$round[$formatDate[$getObjectProperty[list[0].written_on];X]]>
(<t:$round[$formatDate[$getObjectProperty[list[0].written_on];X]]:R>)
:yes}

{field:Votes:
${emojis.general.thumbsup} $replaceText[$replaceText[$checkCondition[$getObjectProperty[list[0].thumbs_up]==];true;0];false;$getObjectProperty[list[0].thumbs_up]] 
${emojis.general.thumbsdown} $replaceText[$replaceText[$checkCondition[$getObjectProperty[list[0].thumbs_down]==];true;0];false;$getObjectProperty[list[0].thumbs_down]]
:yes}

{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$getObjectProperty[list[0].word]!=;{execute:queryNotFound}]

$createObject[$jsonRequest[https://api.urbandictionary.com/v0/define?term=$message]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}