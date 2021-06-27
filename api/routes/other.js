const { pédiluve } = require("../../json/api.json");
const router = require("express").Router();

router.route("/pediluve").get(function (req, res) {
  res.json({
    status: 200,
    image: pédiluve[Math.floor(Math.random() * (pédiluve.length - 0 + 1))],
  });
});

module.exports = router;
