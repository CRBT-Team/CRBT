const { meanings } = require("../../json/api.json");
const { botinfo, instance } = require("../../index");
const router = require("express").Router();

router.route("/").get(function (req, res) {
  res.json({
    online: true,
    news: botinfo.news,
    version: {
      major: botinfo.version,
      build: botinfo.build,
    },
  });
});

router.route("/meaning").get(function (req, res) {
  res.json({
    meaning: meanings[Math.floor(Math.random() * (meanings.length - 0 + 1))],
  });
});

router.route("/stats").get(function (req, res) {
  res.json({
    memberCount: instance.memberCount,
    guildCount: instance.guildCount,
    commandCount: instance.commandCount,
  });
});

module.exports = router;
