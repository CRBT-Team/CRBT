const { pédiluve } = require("../../json/api.json");
const router = require("express").Router();
const { createCanvas } = require("canvas");
const { param, body, validationResult } = require("express-validator");

router.route("/pediluve", async function (req, res) {
  res.json({
    status: 200,
    image: pédiluve[Math.floor(Math.random() * (pédiluve.length - 0 + 1))],
  });
});

router.get(
  "/color/:hex",
  [
    param("hex")
      .isLength({ min: 6, max: 6 })
      .withMessage({
        status: 400,
        error: `Hex code must be an exact length of 6 characters.`,
      })
      .isAlphanumeric()
      .withMessage({
        status: 400,
        error: `Hex code must be A-Z and 0-9`,
      }),
  ],
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(errors.array()[0].msg.status || 500)
        .json(errors.array()[0].msg || "Unexpected Error");
    }

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
  }
);

router.post(
  "/shuffle",
  [
    body("text")
      .isString()
      .withMessage({ status: 400, error: `'text' provided is not a string.` }),
  ],
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(errors.array()[0].msg.status || 500)
        .json(errors.array()[0].msg || "Unexpected Error");
    }

    const newText = req.body.text.trim().split(" ");
    const shifted = newText.shift();
    newText.push(shifted);

    res.json({ result: newText.join(" ") });
  }
);

router.post(
  "/reverse",
  [
    body("text")
      .isString()
      .withMessage({ status: 400, error: `'text' provided is not a string.` }),
  ],
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(errors.array()[0].msg.status || 500)
        .json(errors.array()[0].msg || "Unexpected Error");
    }

    const newText = req.body.text.trim().split("").reverse();

    res.json({ result: newText.join("") });
  }
);

router.get("/animals/:animal", [], async function (req, res) {});

module.exports = router;
