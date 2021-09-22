const meanings = require("../../data/api/CRBTmeanings.json");
const { bot } = require("../../index");
const router = require("express").Router();
const { version } = require("../../package.json");

router.get("/", async function (req, res) {
    res.json({
        status: 200,
        online: true,
        build: version,
    });
});

router.get("/meaning", async function (req, res) {
    res.json({
        status: 200,
        meaning: meanings[Math.floor(Math.random() * (meanings.length - 0 + 1))],
    });
});

router.get("/command/:name", async function(req, res, next) {
    const cmd = bot.client.bot_commands.find(
      (c) =>
            c.name.toLowerCase() === req.params.name.toLowerCase() ||
            (c.aliases && typeof c.aliases === "object"
              ? c.aliases.includes(req.params.name.toLowerCase())
              : c.aliases === req.params.name.toLowerCase())
        ) || {};
    if(!cmd.name) {
        res.status(404).json({
            status: 404,
            error: `Couldn't find the command '${req.params.name}'`,
        });
    }
    else {
        res.json({
            status: 200,
            name: cmd.name,
            aliases: cmd.aliases,
            module: cmd.module,
            cooldown: cmd.cooldown,
            description: cmd.description_enUS,
            usage: cmd.usage_enUS,
            examples: cmd.examples_enUS,
            botPerms: cmd.botPerms,
            userPerms: cmd.userPerms,
        })
    }
})

module.exports = router;