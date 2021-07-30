const { tokens } = require("../../../index");

module.exports.command = {
    name: "github",
    aliases: ["git", "gh", "github-info", "github_info"],
    description_enUS: "Gives info on a specified GitHub user, or a repository (if any specified).",
    usage_enUS: "<GitHub username> <repository (optional)>",
    module: "info",
    examples_enUS: [
        "github Clembs",
        "gh CRBT-Team",
        "git Clembs Clembs"
    ],
    code: `
$if[$argsCount==1]
    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:https://cdn.clembs.xyz/1OGU699.png}

    {description:
    **[GitHub]($getObjectProperty[html_url])**$replaceText[$replaceText[$checkCondition[$getObjectProperty[twitter_username]==];true;];false; | **[Twitter](https://twitter.com/$getObjectProperty[twitter_username])**]$replaceText[$replaceText[$checkCondition[$getObjectProperty[blog]==];true;];false; | **[$replaceText[$replaceText[$replaceText[$replaceText[$getObjectProperty[blog] ;https://;];http://;];/ ;]; ;]]($getObjectProperty[blog])**]
    }

    {field:$get[bio-$getGlobalUserVar[language]]:
    $replaceText[$replaceText[$checkCondition[$getObjectProperty[bio]==];true;$get[none-$getGlobalUserVar[language]]];false;$getObjectProperty[bio]]
    :no}

    {field:$get[location-$getGlobalUserVar[language]]:
    $replaceText[$replaceText[$checkCondition[$getObjectProperty[location]==];true;$get[none-$getGlobalUserVar[language]]];false;$getObjectProperty[location]]
    :no}

    {field:$get[stats-$getGlobalUserVar[language]]:
    $replaceText[$replaceText[$checkCondition[$getObjectProperty[type]==User];true;**[$replaceText[$replaceText[$checkCondition[$getObjectProperty[followers]==];true;0];false;$getObjectProperty[followers]] $get[followers-$getGlobalUserVar[language]]](https://github.com/$getObjectProperty[login]?tab=followers)** | **[$replaceText[$replaceText[$checkCondition[$getObjectProperty[following]==];true;0];false;$getObjectProperty[following]] $get[following-$getGlobalUserVar[language]]](https://github.com/$getObjectProperty[login]?tab=following)** | **[$replaceText[$replaceText[$checkCondition[$getObjectProperty[public_repos]==];true;0];false;$getObjectProperty[public_repos]] $get[repos-$getGlobalUserVar[language]]](https://github.com/$getObjectProperty[login]?tab=repositories)** | **[$replaceText[$replaceText[$checkCondition[$getObjectProperty[public_gists]==];true;0];false;$getObjectProperty[public_gists]] $get[gists-$getGlobalUserVar[language]]](https://gist.github.com/$getObjectProperty[login])**];false;**$replaceText[$replaceText[$checkCondition[$getObjectProperty[public_repos]==];true;0];false;$getObjectProperty[public_repos]] $get[repos-$getGlobalUserVar[language]]**]
    :no}

    {field:$get[joinedGitHub-$getGlobalUserVar[language]]:
    <t:$formatDate[$getObjectProperty[created_at];X]> (<t:$formatDate[$getObjectProperty[created_at];X]:R>)
    :yes}

    {field:$get[lastUpdated-$getGlobalUserVar[language]]:
    <t:$formatDate[$getObjectProperty[updated_at];X]> (<t:$formatDate[$getObjectProperty[updated_at];X]:R>)
    :yes}

    {thumbnail:$getObjectProperty[avatar_url]}
    {color:$getGlobalUserVar[color]}
    ;no]

    $let[title-enUS;$getObjectProperty[login] - GitHub user info]
    $let[bio-enUS;Bio]
    $let[none-enUS;None]
    $let[location-enUS;Location]
    $let[stats-enUS;Stats]
    $let[followers-enUS;follower$replaceText[$replaceText[$checkCondition[$getObjectProperty[followers]==1];true;];false;s]]
    $let[following-enUS;following]
    $let[repos-enUS;public repo$replaceText[$replaceText[$checkCondition[$getObjectProperty[public_repos]==1];true;];false;s]]
    $let[gists-enUS;public gist$replaceText[$replaceText[$checkCondition[$getObjectProperty[public_gists]==1];true;];false;s]]
    $let[joinedGitHub-enUS;Joined GitHub]
    $let[lastUpdated-enUS;Last updated]

    $createObject[$httpRequest[https://api.github.com/users/$message[1];GET;;;{execute:queryNotFound};Authorization:${tokens.github}]]

$elseIf[$argsCount==2]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:https://cdn.clembs.xyz/1OGU699.png}

    {description:
    $replaceText[$replaceText[$getObjectProperty[archived];true;This repository has been archived by the owner. It is now read-only.\n];false;] $replaceText[$replaceText[$getObjectProperty[fork];true;Forked from **[$getObjectProperty[parent.full_name]](https://github.com/$getObjectProperty[parent.full_name])**\n];false;]**[GitHub]($getObjectProperty[html_url])**$replaceText[$replaceText[$checkCondition[$getObjectProperty[homepage]==];true;];false; | **[$replaceText[$replaceText[$replaceText[$replaceText[$getObjectProperty[homepage] ;https://;];http://;];/ ;]; ;]]($getObjectProperty[homepage])**]
    }

    {field:$get[description-$getGlobalUserVar[language]]:
    $replaceText[$replaceText[$checkCondition[$getObjectProperty[description]==];true;$get[none-$getGlobalUserVar[language]]];false;$getObjectProperty[description]]
    :no}

    {field:$get[stats-$getGlobalUserVar[language]]:
    **[$replaceText[$replaceText[$checkCondition[$getObjectProperty[stargazers_count]==];true;0];false;$getObjectProperty[stargazers_count]] $get[star-$getGlobalUserVar[language]]](https://github.com/$getObjectProperty[full_name]/stargazers)** | **[$replaceText[$replaceText[$checkCondition[$getObjectProperty[subscribers_count]==];true;0];false;$getObjectProperty[subscribers_count]] $get[watch-$getGlobalUserVar[language]]](https://github.com/$getObjectProperty[full_name]/watchers)** | **[$replaceText[$replaceText[$checkCondition[$getObjectProperty[forks_count]==];true;0];false;$getObjectProperty[forks_count]] $get[fork-$getGlobalUserVar[language]]](https://github.com/$getObjectProperty[full_name]/network/members)** | **[$replaceText[$replaceText[$checkCondition[$getObjectProperty[open_issues]==];true;0];false;$getObjectProperty[open_issues]] $get[issues-$getGlobalUserVar[language]]](https://github.com/$getObjectProperty[full_name]/issues?q=is%3Aopen+is%3Aissue)**
    :no}

    {field:$get[mainLang-$getGlobalUserVar[language]]:
    $replaceText[$replaceText[$checkCondition[$getObjectProperty[language]==];true;None];false;$getObjectProperty[language]]
    :yes}

    {field:$get[license-$getGlobalUserVar[language]]:
    $replaceText[$replaceText[$checkCondition[$getObjectProperty[license.name]==];true;$get[none-$getGlobalUserVar[language]]];false;$getObjectProperty[license.name]]
    :yes}

    {field:$get[branch-$getGlobalUserVar[language]]:
    [\`$getObjectProperty[default_branch]\`]($getObjectProperty[html_url]/tree/$getObjectProperty[default_branch])
    :yes}

    {field:$get[created-$getGlobalUserVar[language]]:
    <t:$formatDate[$getObjectProperty[created_at];X]> (<t:$formatDate[$getObjectProperty[created_at];X]:R>)
    :yes}

    {field:$get[lastPush-$getGlobalUserVar[language]]:
    <t:$formatDate[$getObjectProperty[pushed_at];X]> (<t:$formatDate[$getObjectProperty[pushed_at];X]:R>)
    :yes}

    {color:$getGlobalUserVar[color]}
    ;no]

    $let[title-enUS;$getObjectProperty[full_name] - GitHub repository info]
    $let[description-enUS;Description]
    $let[none-enUS;None]
    $let[mainLang-enUS;Main language]
    $let[description-enUS;Description]
    $let[stats-enUS;Stats]
    $let[created-enUS;Created at]
    $let[lastPush-enUS;Last commit]
    $let[star-enUS;stargazer$replaceText[$replaceText[$checkCondition[$getObjectProperty[stargazers_count]==1];true;];false;s]]
    $let[watch-enUS;watcher$replaceText[$replaceText[$checkCondition[$getObjectProperty[subscribers_count]==1];true;];false;s]]
    $let[fork-enUS;fork$replaceText[$replaceText[$checkCondition[$getObjectProperty[forks_count]==1];true;];false;s]]
    $let[issues-enUS;open issue$replaceText[$replaceText[$checkCondition[$getObjectProperty[open_issues]==1];true;];false;s]]
    $let[license-enUS;License]
    $let[branch-enUS;Main branch]

    $createObject[$httpRequest[https://api.github.com/repos/$message[1]/$message[2];GET;;;{execute:queryNotFound};Authorization:${tokens.github}]]

$endelseIf
$else
    $loop[1;args]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}