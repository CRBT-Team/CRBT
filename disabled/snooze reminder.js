module.exports.awaitedCommand = {
    name: "remind_snooze",
    code: `
$editMessage[$message[1];
{title:$get[title-$getGlobalUserVar[language]]}
{description:
$get[description-$getGlobalUserVar[language]]
}
]
    `}