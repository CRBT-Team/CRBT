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

bot.onMessage({ guildOnly: false })

const fs = require('fs');
let dir = fs.readdirSync('./commands');

let i = 0;

handler: while (i < dir.length) {
    const stat = fs.statSync('./src/' + dir[i]);

    if (stat.isDirectory()) {
        const readdir = fs.readdirSync('./src/' + dir[i]);

        let nums = 0;
        while (nums < readdir.length) {
            dir.push(dir[i] + '/' + readdir[nums]);
            nums++;
        }
        i++;
        continue handler;
    } else if (stat.isFile()) {
        const command = require('./src/' + dir[i]);
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
const port = 15019

app.get("/crbt", (req, res, next) => {
  res.json({"online": true, "news": botinfo.news});
});

app.listen(port, () => {
  console.log(`Running at https://api.clembs.xyz/crbt (hopefully)`)
});

bot.onUserUpdate()