const { emojis } = require('../..')

module.exports.modules = {
general: `
• \`@<botname>\`
Get a mini-help menu (useful if you've forgotten <botname>'s prefix).
• \`<prefix>help\`
Get CRBT's help on its general usage, or on any command. 
• \`<prefix>report <report message>\`
Report any bug you find on CRBT to its developers!
• \`<prefix>suggest <suggestion message>\`
Suggest anything to add to CRBT!
• \`<prefix>info\`
Get CRBT's ping, stats and some other nerdy info.
• \`<prefix>ping\`
Pings <botname> and then displays information relative to its connection.
• \`<prefix>invite\`
To invite CRBT on your server, or join the support server!
`,
economy: `
• \`<prefix>jobsearch\`
Gives you 3 random job propositions to get you started!
• \`<prefix>hourly\`
Claim a few Purplets every hour to get higher rewards!
• \`<prefix>store\`
Open the Store, where you can buy all sorts of profile items.
• \`<prefix>inventory\`
Opens your item inventory on CRBT, and gives you useful tips!
• \`<prefix>profile\`
Displays your CRBT profile.
`,
fun: `
**__NEW__** **Activities**
These commands will create the following activities in your current voice channel:
• \`<prefix>wordsnacks\` (Word Snacks)
• \`<prefix>lettertile\` (Letter Tile)
• \`<prefix>doodlecrew\` (Doodle Crew)
• \`<prefix>chess\` (Chess in the Park)
• \`<prefix>fishington\` (Fishington.io)
• \`<prefix>betrayal\` (Betrayal.io)
• \`<prefix>poker\` (Poker Night)
• \`<prefix>watch\` (Watch Together)

**Other fun commands**
• \`<prefix>8ball\`
Get a random answer to your question from 8-Ball. 
• \`<prefix>bird, cat, dog, fox, koala, panda\`
Gives a random animal picture and fact.
• \`<prefix>reverse\`
.)nevig smrep fi( koohbew a sa ti sdnes dna txet ruoy sesreveR
• \`<prefix>shout\`
**SHOUTS YOUR MESSAGE OUT LOUD AND SENDS IT IN A WEBHOOK (IF PERMS GIVEN)!!!**
• \`<prefix>textshuffle\`
Shuffles given text.
`,
info: `
• \`<prefix>anime <anime name>\`
• \`<prefix>avatar <user (optional)>\`
• \`<prefix>channelinfo <channel>\`
• \`<prefix>define <english word>\`
• \`<prefix>emojiinfo <emoji>\`
• \`<prefix>github <GitHub username> <repository>\`
• \`<prefix>icon <server ID (optional)>\`
• \`<prefix>inviteinfo <invite link>\`
• \`<prefix>manga <manga name>\`
• \`<prefix>skin <Minecraft player name>\`
• \`<prefix>mcserver <Minecraft server address>\`
• \`<prefix>npm <npm package name>\`
• \`<prefix>roleinfo <role>\`
• \`<prefix>serverinfo <server ID (optional)>\`
• \`<prefix>userinfo <user (optional)>\`
• \`<prefix>urbandictionary <word or expression>\`
• \`<prefix>weather <city>\`
`,
logs: ``,
moderation: `
• \`<prefix>kick\`, \`<prefix>ban\`, \`<prefix>warn\`, \`<prefix>mute\`
Kicks, bans, gives a muted role or a warning to a specified user (via its user ID or a @mention)
• \`<prefix>purge\`
Bulk deletes a specified number of messages in the current channel.
• \`<prefix>snipe\`
Finds the latest deleted message on the current channel, or on a specified channel (if any).
`,
// music: `
// • \`<prefix>play\`
// Queues or directly plays the song of your choice.
// • \`<prefix>nowplaying\`
// Returns what's currently playing.
// • \`<prefix>queue\`
// Gives you a list of all queued songs.
// • \`<prefix>stop\`
// Disconnects <botname> from its voice channels and clears the queue.
// • \`<prefix>volume\`
// Gives you volume controls or manually sets the volume.
// `,
// nsfw: `
// Warning: Contains unsuitable language for minor audiences.
// ||• \`<prefix>blowjob\`
// • \`<prefix>breasts\`
// • \`<prefix>feet\`
// • \`<prefix>hentai\`
// • \`<prefix>lesbian\`
// • \`<prefix>irl\`
// • \`<prefix>sperm\`
// • \`<prefix>vagina\`||
// `,
settings: `
• \`<prefix>color\`
Change <botname>'s accent color across all commands.
• \`<prefix>prefix\`
Change <botname>'s prefix (currently \`<prefix>\`) on the server.
-
• \`<prefix>addemoji <name> <image URL | attachment> | <custom emoji>\`
Adds a specified emoji to the current server.
• \`<prefix>autopublish <channel>\`
Automatically publish messages sent within an announcement channel.
-
• \`<prefix>dashboard\`
Get a list of <botname>'s entire settings for the server or yourself.
• \`<prefix>modules\`
Gives you a list of all modules to enable or disable on the current server.
`,
tools: `
• \`<prefix>coinflip\`
Flips a ${emojis.purplet} Purplet and gives you the result.
• \`<prefix>convert\`
Converts a specified currency into another one.
• \`<prefix>calculate\`
Calculates a given math expression.
• \`<prefix>ocr\`
Fetches text from a given image.
• \`<prefix>pick\`
Picks one choice among multiple options.
• \`<prefix>remindme\`
Reminds you of a specified subject in the given time.
• \`<prefix>rng\`
Gives you a random number from the minimum to the maximum.
• **__NEW__** \`<prefix>translate\`
Translates given text into the target language, from a source language (if any).
`,
}

module.exports.moduleNames = {
general: `General commands`,
economy: `Economy & profiles`,
fun: `Fun commands & activites`,
info: `Info commands`,
moderation: `Moderation commands`,
logs: `Logging`,
//        music: `Music commands`,
//        nsfw: `NSFW commands (18+)`,
settings: `Settings`,
tools: `Tools`,
}