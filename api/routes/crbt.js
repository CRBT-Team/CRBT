const router = require('express').Router();
const { bot } = require('../..');
const meanings = require('../../data/api/CRBTmeanings.json');

router.get('/', async function(req, res) {
  res.status(200).send(':D');
});

router.get('/meaning', async function(req, res) {
  res.status(200).json({
    status: 200,
    meaning: meanings[Math.floor(Math.random() * (meanings.length - 0 + 1))],
  });
});

router.get('/command', async function(req, res) {
  const query = req.query.name;
  if (!query) return res.status(400).json({ status: 400, error: 'No query was entered.' });

  const cmd = bot.client.bot_commands.find((c) =>
    c.name.toLowerCase() === query.toLowerCase() || (
      c.aliases && typeof c.aliases === 'object' ? c.aliases.includes(query.toLowerCase()) : c.aliases === query.toLowerCase())
  ) || {};

  if(!cmd.name) return res.status(404).json({ status: 404, error: `Couldn't find the command '${query}'` });

  res.status(200).json({
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
  });

});

module.exports = router;