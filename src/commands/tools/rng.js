module.exports.command = {
    name: "rng",
    aliases: ["random-number"],
    module: "tools",
    description_enUS: "Gives a random number, between your first and second number, or between 1 and your first number, or a completely random number if no numbers are specified.",
    usage_enUS: "<minimum number (optional)> <maximum number (optional)>",
    examples_enUS: [
        "rng (picks from -10,000 to 10,000)",
        "rng 40 (picks from 1 to 40)",
        "rng 3 50 (picks from 3 to 50)",
        "rng 40.3 50.5 (picks a number with decimals)"
    ],
    code: `
$reply[$messageID;

$if[$argsCount==2]

    $if[$message[2]<$message[1]]

    $if[$checkContains[$message;.]==true]
        {title:= $random[$message[2];$message[1];yes]}
    $else
        $reply[$messageID;
        {title:= $random[$message[2];$message[1]]}
    $endif
    $else
    
    $if[$checkContains[$message;.]==true]
        {title:= $random[$message[1];$message[2];yes]}
    $else
        {title:= $random[$message[1];$message[2]]}
    $endif
    $endif

    $if[$message[1]==$message[2]]
    {title:= $message[2]}
    $endif

$onlyIf[$isNumber[$message[2]]==true;{execute:args}]
$onlyIf[$isNumber[$message[1]]==true;{execute:args}]

    $else
    $if[$argsCount==1]

    $if[$checkContains[$message;.]==true]
        {title:= $random[1;$message[1];yes]}
    $else
        $reply[$messageID;
        {title:= $random[1;$message[1]]}
    $endif

    $onlyIf[$isNumber[$message[1]]==true;{execute:args}]

        $else
        $if[$argsCount==0]

        {title:= $random[-10000;10000]}

        $endif
    $endif
$endif

{color:$getGlobalUserVar[color]}
;no]

$argsCheck[<2;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}