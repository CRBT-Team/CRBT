const { pédiluve } = require("../../json/api.json");
const router = require("express").Router();
const { createCanvas } = require("canvas");

router.route("/pediluve").get(function (req, res) {
  res.json({
    image: pédiluve[Math.floor(Math.random() * (pédiluve.length - 0 + 1))],
  });
});

router.get("/color/:hex", function (req, res) {
  if (req.params.hex.length !== 6)
    return res.send("You must enter a hex code of 6 digits.");

  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = `#${req.params.hex}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const png = canvas.toBuffer();

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": png.length,
  });

  res.end(png);
});

module.exports = router;
