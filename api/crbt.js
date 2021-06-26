const { meanings } = require("../json/api.json");
const { botinfo, instance } = require("../index");

module.exports = (app) => {
  app.get("/crbt/meaning", function (req, res) {
    res.json({
      status: 200,
      meaning: meanings[Math.floor(Math.random() * (meanings.length - 0 + 1))],
    });
  });

  app.get("/crbt", function (req, res) {
    res.json({
      status: 200,
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
      status: 200,
      memberCount: instance.memberCount,
      guildCount: instance.guildCount,
      commandCount: instance.commandCount,
    });
  });
};
