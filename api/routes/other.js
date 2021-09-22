const pédiluve = require("../../data/api/pédiluveImages.json");
const router = require("express").Router();
const { createCanvas } = require("canvas");
const { param, body, validationResult } = require("express-validator");
let kitsu = require('kitsu.js')
const kitsus = new kitsu()

router.get("/pédiluve", async function (req, res) {
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

module.exports = router;