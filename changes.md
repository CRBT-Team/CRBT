Devlog: Morgan, 2021-05-06 - 2021-06-06
1. The telemetry channel ID has been moved to .env, used as "TELEMETRY"
2. { ADDED FOR DEV HELPERS } Added "ID" to .env, insert your discord ID and you will have access to all "!op" commands
3. All JSON files (colors, emojis, jobs etc) have been moved into 2 seperate files. store.json contains all of the store items and config.json contains the rest. They can all easily be imported into a command using "const { colors, emojis... } = require("../(...)/index.js")" 
4. Moved API from index.js to api.js
5. Added "/crbt/stats" to API, cannot get user or guild count Clembs pls help
6. Added instance, its pretty much an easier way to have variables and other bot info around the bot and can be imported using "const { instance } = require("../(...)/index.js")"

Devlog: Clembs, 2021-06-06
1. Updated build number & news
2. Temporarily removed experiments
3. Changed listeners to be more compact
4. Removed unnecessary dependencies