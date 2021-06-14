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
app.get("/pediluve", function (req, res) {
  res.json({
    image: files.pédiluve[randomPédiluve]
  })
})

app.set("json spaces", 2);

app.listen(port, () => {
  console.log(`Connected to the Clembs API (Port: 15019)`);
}).on("error", () => {
  app.listen(process.env.PORT, function () {
    console.log(`Connected to the Clembs API (Port: ${process.env.PORT})`);
  }).on("error", () => {
    console.log("Couldn't connect to Clembs API!");
  });
});