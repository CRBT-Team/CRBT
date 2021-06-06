const express = require("express");
const { readFileSync } = require("fs");
const app = express();
const port = process.env.PORT;
const { links, botinfo } = require("./index");
const instance = require("./instance");

app.get("/", function (req, res) {
  res.json({
    server: links.info.discord,
    endpoints: {
      crbt: {
        method: "GET",
        description: "Retrieves information on CRBT.",
      },
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

app.set("json spaces", 2);

app.listen(port, () => {
  console.log(`Connected to the Clembs API (Port: ${port})`);
});
