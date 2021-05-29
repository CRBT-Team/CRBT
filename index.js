const dbdExpress = require("dbd.express")
const Aoijs = require("aoi.js")
require('dotenv').config()

const colors = require('./json/colors.json');
const emojis = require('./json/emojis.json');
const items = require('./json/items.json');
const jobs = require('./json/jobs.json');
const links = require('./json/links.json');
const tokens = require('./json/tokens.json');
const botinfo = require('./package.json');

const bot = new Aoijs.Bot({
  token: process.env.token,
  prefix: ["$getServerVar[prefix]", "<@$clientID>", "<@!$clientID>"],
  mobile: false,
  sharding: false,
})

bot.onMessage({
  guildOnly: false
})

bot.variables({//misc
blocklisted: false, prefix: "()",
city: "", query: "", r34_query: "", 
webhook_token: "", webhook_id: "",
volume: 50, color: `${colors.crbt.devblue}`,
last_cmd: "", avatarlog: "", language: "enUS",
telemetry: "minimal", active_reminders: "",
})
bot.variables({//todolist
  list_1: "",
  list_2: "",
  list_3: "",
  list_4: "",
  list_5: "",
  list_6: "",
  list_7: "",
  list_8: "",
  list_9: "",
  list_10: "",
})
bot.variables({//modules
module_economy: true,
  module_serverstores: true,
  module_serverprofiles: true,
module_fun: true,
module_misc: true,
  module_basic: true,
  module_autoreact: true,
  module_nsfw: false,
module_utility: true,
  module_tools: true,
  module_info: true,
module_music: true,
  module_radios: true,
module_settings: true,
  module_moderation: true,
  module_management: true,
  module_autopublish: false,
  module_messagelogs: false,
  module_joinmessages: false,
  module_leavemessages: false,
  module_statschannel: false,
  module_customcommands: false,
})
bot.variables({//economy
user_bank: 0, hourly_streak: 0,
invbanner: "", invmisc: "", invbadge: "",
job_type: "", job_xp: 0, job_req: 1500, job_level: 1, job_propositions: "",
})
bot.variables({//user profiles
profile_name: "<username>", profile_about: "Not set", 
profile_banner: "", profile_badges: "", profile_layout: "basic",
})
bot.variables({//server profiles
guild_contributors: "", guild_contributed: 0, 
guild_trophies: "None", guild_partnered: false, 
guild_description: "None", guild_bank: 0,
})
bot.variables({//partner commands
JaaJ: 0, sexes: 0, sexlogs: "",
})
bot.variables({//moderation
muted_role: "", modlog: "", strikes: 0
})
bot.variables({//log settings
messagelogs_channel: "None", serverlogs_channel: "None", modlogs_channel: "None", memberlogs_channel: "None",
logging_look: "fancy",
autopublishedchannels: "", memberstats_channel: "None",
})
bot.variables({//flags
crbtplus: false, languages: false, debug: false, accessibility: false
})

const fs = require('fs');
let dir = fs.readdirSync('./commands');

let i = 0;

handler: while (i < dir.length) {
    const stat = fs.statSync('./commands/' + dir[i]);

    if (stat.isDirectory()) {
        const readdir = fs.readdirSync('./commands/' + dir[i]);

        let nums = 0;
        while (nums < readdir.length) {
            dir.push(dir[i] + '/' + readdir[nums]);
            nums++;
        }
        i++;
        continue handler;
    } else if (stat.isFile()) {
        const command = require('./commands/' + dir[i]);
        try {
            bot[Object.keys(command)[0]](command[Object.keys(command)[0]]);
            i++;
            continue handler;
        } catch (err) {
            console.error(err.message);
            delete dir[i];

            continue handler;
        }
    } else {
        console.error('Directory was not a Folder or File');
        delete dir[i];

        continue handler;
    }
}

const express = require('express')
const app = express()
const port = 6969

app.get('/', (req, res, next) => {
  res.json({"status": process.env.status});
})

app.listen(port, () => {
  console.log(`Running at https://api.crbt.ga`)
})

bot.onUserUpdate()