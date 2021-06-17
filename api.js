const express = require("express");
const { readFileSync } = require("fs");
const app = express();
const port = process.env.PORT;
const { links, botinfo } = require("./index");
const instance = require("./instance");

const { pédiluve } = require("./json/api.json");

app.get("/", function (req, res) {
  res.json({
    "welcomeMessage": "Welcome to the Clembs API, currently in beta.",
    "supportServer": links.info.discord,
    "endpoints": {
      "crbt": {
        "method": "GET",
        "description": "Retrieves info on CRBT & its latest version.",
      },
      "crbt/stats": {
        "method": "GET",
        "description": "Get member count, guild count & command count on CRBT."
      }
    },
  });
});
app.get("/crbt", function (req, res) {
  res.json({
    online: true,
    news: botinfo.news,
    version: {
      major: botinfo.version,
      build: botinfo.build,
    },
  });
});
app.get("/crbt/stats", function (req, res) {
  res.json({
    memberCount: instance.memberCount,
    guildCount: instance.guildCount,
    commandCount: instance.commandCount,
  });
});

app.get("/pediluve", function (req, res) {
  res.json({
    image: pédiluve[Math.floor(Math.random() * (pédiluve.length - 0 + 1))]
  })
})

app.set("json spaces", 2);

app.listen(port, () => {
  if (port === "15019") {
    console.log(`Connected to the Clembs API (https://api.clembs.xyz)`);
  } else {
    console.log(`Connected to the Clembs API (http://localhost:${port})`)
  };
}).on("error", () => {
  console.log("Couldn't connect to Clembs API!");
});