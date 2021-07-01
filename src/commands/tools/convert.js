module.exports.command = {
    name: "convert",
    aliases: ["currency", "conv", "$"],
    module: "tools",
    description_enUS: "Converts a specified amount (if any) of a given currency into other currencies or into another given currency.",
    usage_enUS: "<from (optional)> <to (optional)> <amount (optional)>",
    code: `
$if[$argsCount==3]

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {field:$toUppercase[$message[1]]:
    $message[3]
    :yes}
    {field:$toUppercase[$message[2]]:
    $roundTenth[$getObjectProperty[result];2]
    :yes}
    {color:$getGlobalUserVar[color]}
    ;no]

    $onlyIf[$getObjectProperty[query.amount]!=;{execute:args}]
    $onlyIf[$getObjectProperty[info.rate]!=;{execute:args}]
    $onlyIf[$getObjectProperty[result]!=;{execute:args}]

    $createObject[$jsonRequest[https://api.exchangerate.host/convert?from=$toUppercase[$message[1]]&to=$toUppercase[$message[2]]&amount=$message[3]]]

$endif

$if[$argsCount==2]

    $if[$isNumber[$message[2]]==true]

        $reply[$messageID;
        {title:$get[title-$getGlobalUserVar[language]]}
        {field:$toUppercase[$message[1]]:
        $message[2]
        :yes}
        $if[$toLowercase[$message[1]]!=usd]
        {field:USD:
        $roundTenth[$getObjectProperty[rates.USD];2]
        :yes}
        $endif
        $if[$toLowercase[$message[1]]!=eur]
        {field:EUR:
        $roundTenth[$getObjectProperty[rates.EUR];2]
        :yes}
        $endif
        $if[$toLowercase[$message[1]]!=gbp]
        {field:GBP:
        $roundTenth[$getObjectProperty[rates.GBP];2]
        :yes}
        $endif
        $if[$toLowercase[$message[1]]!=jpy]
        {field:JPY:
        $roundTenth[$getObjectProperty[rates.JPY];2]
        :yes}
        $endif
        $if[$toLowercase[$message[1]]!=rub]
        {field:RUB:
        $roundTenth[$getObjectProperty[rates.RUB];2]
        :yes}
        $endif
        {color:$getGlobalUserVar[color]}
        ;no]
        
        $onlyIf[$getObjectProperty[rates.EUR]!=;{execute:args}]
        $onlyIf[$getObjectProperty[base]==$toUppercase[$message[1]];{execute:args}]

        $createObject[$jsonRequest[https://api.exchangerate.host/latest?base=$toUppercase[$message[1]]&symbols=USD,JPY,BRL,EUR,RUB,GBP&amount=$message[2]]]

    $else

        $reply[$messageID;
        {title:$get[title-$getGlobalUserVar[language]]}
        {field:$toUppercase[$message[1]]:
        1
        :yes}
        {field:$toUppercase[$message[2]]:
        $roundTenth[$getObjectProperty[result];2]
        :yes}
        {color:$getGlobalUserVar[color]}
        ;no]

        $onlyIf[$getObjectProperty[query.amount]!=;{execute:args}]
        $onlyIf[$getObjectProperty[info.rate]!=;{execute:args}]
        $onlyIf[$getObjectProperty[result]!=;{execute:args}]

        $createObject[$jsonRequest[https://api.exchangerate.host/convert?from=$toUppercase[$message[1]]&to=$toUppercase[$message[2]]&amount=1]]

    $endif

$endif

$if[$argsCount==1]

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {field:$toUppercase[$message[1]]:
    1
    :yes}
    $if[$toLowercase[$message[1]]!=usd]
    {field:USD:
    $roundTenth[$getObjectProperty[rates.USD];2]
    :yes}
    $endif
    $if[$toLowercase[$message[1]]!=eur]
    {field:EUR:
    $roundTenth[$getObjectProperty[rates.EUR];2]
    :yes}
    $endif
    $if[$toLowercase[$message[1]]!=gbp]
    {field:GBP:
    $roundTenth[$getObjectProperty[rates.GBP];2]
    :yes}
    $endif
    $if[$toLowercase[$message[1]]!=jpy]
    {field:JPY:
    $roundTenth[$getObjectProperty[rates.JPY];2]
    :yes}
    $endif
    $if[$toLowercase[$message[1]]!=rub]
    {field:RUB:
    $roundTenth[$getObjectProperty[rates.RUB];2]
    :yes}
    $endif
    {color:$getGlobalUserVar[color]}
    ;no]

    $onlyIf[$getObjectProperty[base]==$toUppercase[$message[1]];{execute:args}]

    $createObject[$jsonRequest[https://api.exchangerate.host/latest?base=$toUppercase[$message[1]]&symbols=USD,JPY,BRL,EUR,RUB,GBP&amount=1]]

$endif

$if[$argsCount==0]

$reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {field:USD:
    $roundTenth[$getObjectProperty[rates.USD];2]
    :yes}
    {field:EUR:
    $roundTenth[$getObjectProperty[rates.EUR];2]
    :yes}
    {field:GBP:
    $roundTenth[$getObjectProperty[rates.GBP];2]
    :yes}
    {field:JPY:
    $roundTenth[$getObjectProperty[rates.JPY];2]
    :yes}
    {field:RUB:
    $roundTenth[$getObjectProperty[rates.RUB];2]
    :yes}
    {field:BRL:
    $roundTenth[$getObjectProperty[rates.BRL];2]
    :yes}
    {color:$getGlobalUserVar[color]}
    ;no]

    $createObject[$jsonRequest[https://api.exchangerate.host/latest?base=USD&symbols=USD,JPY,BRL,EUR,RUB,GBP&amount=1]]

$endif

$let[title-enUS;Currency conversion]

$argsCheck[<4;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}