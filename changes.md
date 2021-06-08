### Devlog: Morgan, 2021-05-06 - 2021-06-06
- The telemetry channel ID has been moved to .env, used as "TELEMETRY"
- { ADDED FOR DEV HELPERS } Added "ID" to .env, insert your discord ID and you will have access to all "!op" commands
- All JSON files (colors, emojis, jobs etc) have been moved into 2 seperate files. store.json contains all of the store items and config.json contains the rest. They can all easily be imported into a command using "const { colors, emojis... } = require("../(...)/index.js")" 
- Moved API from index.js to api.js
- Added "/crbt/stats" to API, cannot get user or guild count Clembs pls help
- Added instance, its pretty much an easier way to have variables and other bot info around the bot and can be imported using "const { instance } = require("../(...)/index.js")"

### Devlog: Clembs, 2021-06-06
- Updated build number & news
- Temporarily removed experiments
- Changed listeners to be more compact
- Removed unnecessary dependencies

### Devlog: Clembs, 2021-06-07
- Added Spotify API key (if we ever need it)
- Minor fixes
- Optimized ()ui & ()pfp by fetching the user ID only once
- Added a more serious status
- ()play:
    - Added error messages
    - Added special messages for playlists
    - Fixed some bugs
    - Changed the message modification delay dynamically depending
- Added the message when the bot leaves the channel for inactivity

### Devlog: Clembs, 2021-06-08
- Partially fixed ()userinfo
- Completely removed experiments
- Added illustrations in ./json/config.json
- Renamed a lot of the files to be camelCase
- Made OP commands not require a process.env.id
- Other minor fixes