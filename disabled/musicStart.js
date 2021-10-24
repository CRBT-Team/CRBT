module.exports.musicStartCommand = {
    channel: "$channelID", 
    code: `
$if[$checkContains[$getServerVar[volume];-muted]==true]

$volume[0]

$else

$volume[$getServerVar[volume]]

$endif
`}