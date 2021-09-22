module.exports.command = {
    name: "burgerkingfootlettuce",
    description_enUS: "Burger King foot lettuce",
    module: "fun",
    aliases: ["bkfl", "bkly"],
    code: `
$reply[$messageID;
  {title:You asked for it...}
  {image:$get[image]}
  {color:$getGlobalUserVar[color]}
;no]

$let[image;$randomText[
    https://ca-times.brightspotcdn.com/dims4/default/602355b/2147483647/strip/true/crop/500x375+0+0/resize/840x630!/quality/90/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fb0%2F1b%2Faa427ab1bca01f6c71e5d18df1d0%2Fla-fi-mo-burger-king-lettuce-4chan-20120718-001;
    https://pbs.twimg.com/media/DfwzPq2X4AAcX8d.jpg;
    https://i.redd.it/oxgab5odr8d01.jpg;
    http://pm1.narvii.com/7207/30fa13da779116942b9577f598c6dba4fdede4fdr1-640-784v2_uhq.jpg
]]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}