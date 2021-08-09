const { emojis } = require("../../index")

let data = {
    suggested: {
        basic1: [
            `<prefix>invite - To invite CRBT on your server, or join the support server!`,
            `<prefix>report - Report any bug you find on CRBT to its developers!`,
            `<prefix>info - Get CRBT's ping, stats and some other nerdy info.`
        ],
        basic2: [
            `<prefix>suggest - Suggest anything to add to CRBT!`,
            `<prefix>ping - Pings <botname> and then displays information relative to its connection.`
        ],
        economy1: [
            `<prefix>jobsearch - Gives you 3 random job propositions to get you started!`,
            `<prefix>hourly - Claim a few Purplets every hour to get higher rewards!`,
            `<prefix>inventory - Opens your item inventory on CRBT, and gives you useful tips!`
        ],
        economy2: [
            `<prefix>store - Open the Store, where you can buy all sorts of profile items.`,
            `<prefix>profile - Displays your CRBT profile.`
        ],
        fun1: [
            `<prefix>8ball - Asks your question to 8-Ball, and retrieves its answer.`,
            `<prefix>reverse - Reverses your text and sends it as a webhook (if perms given).`,
            `<prefix>textshuffle - Shuffles given text.`
        ],
        fun2: [
            `<prefix>bird, cat, dog, fox, koala, panda - Gives a random animal pic + fact!`,
            `<prefix>shout - Shouts your message out loud and sends it as a webhook (if perms given)`
        ],
        info1: [
            `<prefix>avatar - Get your or a specified user's profile picture.`
            `<prefix>anime, manga - Get info about a manga or anime on kitsu.io.`,
            `<prefix>emojiinfo - Get a bigger image of a selected emoji, along with some info.`
        ],
        info2: [
            `<prefix>userinfo - Get information about your Discord profile, or someone else's (if specified).`
            `<prefix>skin - Get a Minecraft Java player's skin.`
        ],
        moderation1: [
            `<prefix>kick, ban, warn - Kicks, bans or gives a warning to a specified user.`,
            `<prefix>mute - Gives the set muted role to a specified user, muting them.`,
            `<prefix>purge - Bulk deletes a specified amount of messages in a channel.`
        ],
        moderation2: [
            `<prefix>snipe - Gets the contents of the lastly deleted message in this channel or in a specified channel (if any).`
        ],
        music1: [
            `<prefix>play - Plays or queues a specified song (through search terms or a URL)`,
            `<prefix>nowplaying - Returns what's currently playing.`,
            `<prefix>stop - Disconnects <botname> from its voice channels and clears the queue.`
        ],
        music2: [
            `<prefix>queue - Gives you a list of all queued songs.`,
            `<prefix>volume - Gives you volume controls or manually sets the volume.`
        ],
        settings_true1: [
            `<prefix>prefix - Change <botname>'s prefix (currently \`<prefix>\`) on the server.`,
            `<prefix>addemoji - Adds an image or emoji in the server's emojis.`,
            `<prefix>dashboard - Get a list of <botname>'s entire settings for the server or yourself.`
        ],
        settings_true2: [
            `<prefix>color - Change <botname>'s accent color across all commands.`,
            `<prefix>experiments - Enable or disable <botname>'s experimental features and commands.`
        ],
        settings_false1: [
            `<prefix>color - Change <botname>'s accent color across all commands.`,
            `<prefix>experiments - Enable or disable <botname>'s experimental features and commands.`,
            `<prefix>dashboard - Get a list of <botname>'s entire settings for the server or yourself.`
        ],
        settings_false2: [
            `<prefix>prefix - Change <botname>'s prefix (currently \`<prefix>\`) on the server.`,
            `<prefix>addemoji - Adds an image or emoji in the server's emojis.`
        ],
        tools1: [
            `<prefix>pick - Picks one choice among multiple options.`,
            `<prefix>remindme - Reminds you of a specified subject in the given time.`,
            `<prefix>calc - Calculates a given math expression.`,
            `<prefix>ocr - Fetches text from a given image.`
        ],
        tools2: [
            `<prefix>coinflip - Flips a coin and gives you the result.`,
            `<prefix>translate - Translates given text into a specified language.`,
        ]
    },
    modules: {
        basic: `
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
        • \`<prefix>8ball\`
        Asks your question to 8-Ball, and retrieves its answer. 
        • \`<prefix>bird\`, \`cat\`, \`dog\`, \`fox\`, \`koala\` or \`panda\`
        Gives a random animal picture and a fact!
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
        moderation: `
        • \`<prefix>kick\`, \`<prefix>ban\`, \`<prefix>warn\`, \`<prefix>mute\`
        Kicks, bans, gives a muted role or a warning to a specified user (via its user ID or a @mention)
        • \`<prefix>purge\`
        Bulk deletes a specified number of messages in the current channel.
        • \`<prefix>snipe\`
        Finds the latest deleted message on the current channel, or on a specified channel (if any).
        `,
        music: `
        • \`<prefix>play\`
        Queues or directly plays the song of your choice.
        • \`<prefix>nowplaying\`
        Returns what's currently playing.
        • \`<prefix>queue\`
        Gives you a list of all queued songs.
        • \`<prefix>stop\`
        Disconnects <botname> from its voice channels and clears the queue.
        • \`<prefix>volume\`
        Gives you volume controls or manually sets the volume.
        `,
        nsfw: `
        Warning: Contains unsuitable language for minor audiences.
        ||• \`<prefix>blowjob\`
        • \`<prefix>breasts\`
        • \`<prefix>feet\`
        • \`<prefix>hentai\`
        • \`<prefix>lesbian\`
        • \`<prefix>irl\`
        • \`<prefix>sperm\`
        • \`<prefix>vagina\`||
        `,
        settings: `
        • \`<prefix>color\`
        Change <botname>'s accent color across all commands.
        • \`<prefix>experiments <"on" | "off">\`
        Enable or disable <botname>'s experimental features and commands.
        • \`<prefix>prefix\`
        Change <botname>'s prefix (currently \`<prefix>\`) on the server.
        -
        • \`<prefix>addemoji <name> <image URL | attachment> | <custom emoji>\`
        Adds a specified emoji to the current server.
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
        • \`<prefix>translate\`
        Translates given text into the target language.
        `,
    },
    moduleNames: {
        basic: `Basic commands`,
        economy: `Economy & profiles`,
        fun: `Fun commands`,
        info: `Info commands`,
        moderation: `Moderation commands`,
        music: `Music commands`,
        nsfw: `NSFW commands (18+)`,
        settings: `Settings`,
        tools: `Tools`,
    }

}

module.exports = data