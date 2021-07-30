module.exports.joinCommand = {
    channel: "660278401378287709",
    code: `
$if[$roleExists[718944495105867898]==true]
    
    $giveRole[$authorID;718944495105867898]

$else
    
    $sendDM[277168541906763786;
    woops uh the goblin role is gone ask clembs to tell me what's the new role
    ]

$endif

$onlyForServerIDs[660278400925171722;]
    `}