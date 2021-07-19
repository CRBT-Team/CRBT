const { meanings } = require("../../data/api.json");
const { bot, botinfo, instance } = require("../../index");
const router = require("express").Router();

router.get("/", async function (req, res) {
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

router.get("/meaning", async function (req, res) {
    res.json({
        status: 200,
        meaning: meanings[Math.floor(Math.random() * (meanings.length - 0 + 1))],
    });
});

router.get("/stats", async function (req, res) {
    res.json({
        status: 200,
        memberCount: instance.memberCount,
        guildCount: instance.guildCount,
        commandCount: instance.commandCount,
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
            description: {
                enUS: cmd.description_enUS,
                enUK: cmd.description_enUK,
                frFR: cmd.description_frFR,
                esES: cmd.description_esES,
                ru: cmd.description_ru,
                ptBR: cmd.description_ptBR,
            },
            usage: {
                enUS: cmd.usage_enUS,
                enUK: cmd.usage_enUK,
                frFR: cmd.usage_frFR,
                esES: cmd.usage_esES,
                ru: cmd.usage_ru,
                ptBR: cmd.usage_ptBR,
            },
            botPerms: cmd.botPerms,
            userPerms: cmd.userPerms,
        })
    }
})

module.exports = router;