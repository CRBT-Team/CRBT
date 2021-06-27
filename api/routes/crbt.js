const { meanings } = require("../../json/api.json");
const { botinfo, instance } = require("../../index");
const router = require("express").Router();

router.get("/", function (req, res) {
  res.json({
    online: true,
    news: botinfo.news,
    version: {
      major: botinfo.version,
      build: botinfo.build,
    },
  });
});

router.get("/meaning", function (req, res) {
  res.json({
    meaning: meanings[Math.floor(Math.random() * (meanings.length - 0 + 1))],
  });
});

router.get("/stats", function (req, res) {
  res.json({
    memberCount: instance.memberCount,
    guildCount: instance.guildCount,
    commandCount: instance.commandCount,
  });
});

module.exports = router;
