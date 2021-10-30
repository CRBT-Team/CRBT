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

router.get('/vars', async function(req, res) {
  const variable = req.query.var;
  const key = req.query.APIKey;
  const id = req.query.id;
  const vars = Object.assign(require('../../src/variables/serverVars').variables, require('../../src/variables/userVars').variables);
  
  if(key !== process.env.API_KEY) return res.status(401).json({ status: 401, error: 'Invalid API key.' });
  if(!variable) return res.status(400).json({ status: 400, error: 'No variable was entered.' });
  if(!vars[variable]) return res.status(404).json({ status: 404, error: `Couldn't find the variable '${variable}'` });
  if(!id) return res.status(200).json({ status: 200, value: vars[variable] });

  let item = await bot.client.db.get('main', `${variable}_${id}`);
  if(!item) item = { value: vars[variable] };

  res.status(200).json({ status: 200, value: item.value });

});

router.post('/vars', async function(req, res) {

  function aoiJsMode() {
    const returns = {};
    returns.vars = Object.assign(require('../../src/variables/serverVars').variables, require('../../src/variables/userVars').variables);

    console.log(req.rawHeaders);
    if(req.rawHeaders.find((h) => h.includes('aoi.js'))) {
      try {
        const request = JSON.parse(Object.keys(req.body)[0]);
        console.log(request);
        returns.variable = request.var;
        returns.id = request.id;
        returns.value = request.value;
        returns.key = request.key;
        return returns;
      } catch {
        res.status(400).json({ status: 400, error: 'Invalid request.' });
      }
    } else {
      returns.variable = req.body.var;
      returns.id = req.body.id;
      returns.value = req.body.value;
      returns.key = req.body.key;
      return returns;
    }
  }
  
  const { vars, variable, id, value, key } = aoiJsMode();

  if(key !== process.env.API_KEY) return res.status(401).json({ status: 401, error: 'Invalid API key.' });
  
  if(!variable) return res.status(400).json({ status: 400, error: 'No variable was entered.' });
  if(!vars[variable]) return res.status(404).json({ status: 404, error: `Couldn't find the variable '${variable}'` });
  if(!id) return res.status(400).json({ status: 400, error: 'No id was entered.' });
  if(!value) return res.status(400).json({ status: 400, error: 'No value was entered.' });

  await bot.client.db.set('main', `${variable}_${id}`, value);

  res.status(200).json({ status: 200, value: value });
});

module.exports = router;