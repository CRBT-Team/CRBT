const { tokens } = require("../../../index");

module.exports.command = {
    name: "github",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.clembs.xyz/1OGU699.png}

{description:
**[GitHub]($getObjectProperty[html_url])** | **[Twitter](https://twitter.com/$getObjectProperty[twitter_username])** | **[Blog]($getObjectProperty[blog])**
}

{field:Bio:
$getObjectProperty[bio]▪
:yes}

{field:Stats:
[$getObjectProperty[followers] followers](https://github.com/$getObjectProperty[name]?tab=followers)
[$getObjectProperty[following] following](https://github.com/$getObjectProperty[name]?tab=following)
[$getObjectProperty[public_repos] public repos](https://github.com/$getObjectProperty[name]?tab=repositories)
$getObjectProperty[public_gists] public gists
:yes}

{field:Joined GitHub:
<t:$formatDate[$getObjectProperty[created_at];X]> (<t:$formatDate[$getObjectProperty[created_at];X]:R>)
:yes}

{thumbnail:$getObjectProperty[avatar_url]}
{color:$getGlobalUserVar[color]}
;no]


$let[title-enUS;$getObjectProperty[name] - GitHub user info]

$createObject[$httpRequest[https://api.github.com/users/$message;GET;;;;Authorization:${tokens.github}]]
    `}