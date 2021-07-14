const { pédiluve } = require("../../json/api.json");
const router = require("express").Router();
const { createCanvas } = require("canvas");
const { param, body, validationResult } = require("express-validator");
// const Animal = require("../Schema/Animal");
// const animalChecks = require("../Utils/animalChecks");
// const checkWords = require("../Utils/checkWords");
const fetch = require("node-fetch");
let kitsu = require('kitsu.js')
const kitsus = new kitsu()

router.get("/pediluve", async function (req, res) {
    res.json({
        status: 200,
        image: pédiluve[Math.floor(Math.random() * (pédiluve.length - 0 + 1))],
    });
});

router.get("/anime/:title", async function(req, res) {
    if (!req.params.title) return res.json({success: "false", message: "You need to input a title."});
    
    let query = req.params.title
    let a = query.split('+') || query.split('%20') || query.split(' ')
    let searched = a.join(' ')
    
    let result = await kitsus.searchAnime(searched)
    if (!result[0]) return res.json({success: "false", message: "Couldn't find this anime."});
    let anime = result[0]
    res.json(anime)
})

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
/*
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

router.get("/animal/", async function (req, res) {
  const animal = await Animal.find({});

  res.json(animal);
});

router.post(
  "/animal/new",
  [
    body("name").isString().withMessage({
      status: 400,
      error: `Please make sure your animals name is A-Z, a-z`,
    }),
    body("animal").exists(),
    body("image").exists(),
  ],
  async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(errors.array()[0].msg.status || 500)
        .json(
          errors.array()[0].msg || { status: 5000, error: "Unexpected Error" }
        );
    }

    const { animal: ani, name, info, image } = req.body;

    const animal = await Animal.create({
      animal: ani,
      name: name,
      image: image,
    });

    res.json(animal);
  }
);

router.get("/animal/random/", async function (req, res) {
  let fAnimals = await Animal.find({});

  fetch("https://some-random-api.ml/facts/dog")
    .then((r) => r.json())
    .then((r) =>
      res.json({
        animal: fAnimals[Math.floor(Math.random() * fAnimals.length)],
        fact: r.fact,
      })
    );
});

router.get("/animal/random/:type", async function (req, res) {
  const fAnimals = await Animal.find({ animal: req.params.type });

  fetch("https://some-random-api.ml/facts/dog")
    .then((r) => r.json())
    .then((r) =>
      res.json({
        animal: fAnimals[Math.floor(Math.random() * fAnimals.length)],
        fact: r.fact,
      })
    );
});
*/
module.exports = router;