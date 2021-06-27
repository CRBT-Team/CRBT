const { links, emojis } = require("../../../index");

module.exports.command = {
    name: "iteminfo",
    aliases: ["item-info", "item_info", "item", "io"],
    usage_enUS: "<item name (e.g. \"banner stripes\", \"badge flushed\")>",
    module: "economy",
    code: `
$if[$checkContains[$toLowercase[$message[1]];banner]==true]
    
    $reply[$messageID;

    {author:$toLocaleUppercase[$getObjectProperty[banners.$get[a].name]] - Banner information}
    {description:
    $getObjectProperty[banners.$get[a].description]
    **Credits:** $getObjectProperty[banners.$get[a].credits]
    }

    {field:Store season:
    $toLocaleUppercase[$getObjectProperty[banners.$get[a].season]]
    :yes}

    {field:Value: 
    $replaceText[$replaceText[$getObjectProperty[banners.$get[a].available];true;${emojis.general.purplet} **$getObjectProperty[banners.$get[a].value] Purplets**]\n\`$getServerVar[prefix]buy badge\`;false;Not for sale]
    :yes}

    {image:${links.banners}$getObjectProperty[banners.$get[a].season]/$getObjectProperty[banners.$get[a].contents]}
    {color:$getGlobalUserVar[color]}
    ;no] 

    $onlyIf[$getObjectProperty[banners.$get[a]]!=;{execute:unknownItem}]

    $djsEval[const { items } = require("../../../../../index");
    d.object.banners = items.banners;]
    $let[a;$replaceText[$replaceText[$toLowercase[$message];banner;]; ;]]   
    
$elseIf[$checkContains[$toLowercase[$message[1]];badge]==true]
    
    $reply[$messageID;

    {author:$getObjectProperty[badges.$get[a].name] - Badge information}

    {description:$getObjectProperty[badges.$get[a].contents]}

    {field:Category:
    $toLocaleUppercase[$getObjectProperty[badges.$get[a].type]]
    :yes}

    {field:Value: 
    $replaceText[$replaceText[$getObjectProperty[badges.$get[a].available];true;${emojis.general.purplet} **$getObjectProperty[badges.$get[a].value] Purplets**];false;Not for sale]
    :yes}

    {color:$getGlobalUserVar[color]}
    {thumbnail:$get[image]}
    ;no]

        $let[image;$replaceText[$replaceText[$checkContains[$getObjectProperty[badges.$get[a].contents];#LEFT_CLICK#];true;$get[emo]];false;$get[twi]]]
        $let[emo;https://cdn.discordapp.com/emojis/$get[id].$replaceText[$replaceText[$get[animated];false;png];true;gif]]
        $let[animated;$checkCondition[$splitText[1]==<a]]
        $let[id;$replaceText[$splitText[3];>;]]
        $let[twi;https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/$replaceText[$getObjectProperty[unicode]; ;-].png]
        $djsEval[const message = "$getObjectProperty[badges.$getObjectProperty[a].contents]";
        const unicode = require("emoji-unicode");
        d.object.unicode = unicode(message);]
        $addObjectProperty[a;$get[a]]
        
        $textSplit[$replaceText[$getObjectProperty[badges.$get[a].contents];#COLON#;@];@]

    $onlyIf[$getObjectProperty[badges.$get[a]]!=;{execute:unknownItem}]
    
    $djsEval[const { items } = require("../../../../../index");
    d.object.badges = items.badges;]
    $let[a;$replaceText[$replaceText[$toLowercase[$message];badge;]; ;]]  

$endelseIf
$endif

$argsCheck[>2;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}