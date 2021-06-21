module.exports.command = {
    name: "rng",
    aliases: ["random-number", "randint"],
    module: "tools",
    description_enUS: "",
    usage_enUS: "",
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
        {title:= $random[0;$message[1];yes]}
    $else
        $reply[$messageID;
        {title:= $random[0;$message[1]]}
    $endif

    $onlyIf[$isNumber[$message[1]]==true;{execute:args}]

        $else
        $if[$argsCount==0]

        {title:= $random[-1000000000;1000000000]}

        $endif
    $endif
$endif

{color:$getGlobalUserVar[color]}
;no]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
    `}