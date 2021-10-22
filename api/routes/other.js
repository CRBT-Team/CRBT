const router = require('express').Router();
const pédiluve = require('../../data/api/pédiluveImages.json');
const languages = require('../../data/misc/languageShortCodes.json');
const { createCanvas } = require('canvas');
const Kitsu = require('kitsu.js');
const kitsu = new Kitsu();
const translate = require('@vitalets/google-translate-api');

router.get('/pediluve', function (req, res) {
  res.status(200).json({
    status: 200,
    image: pédiluve[Math.floor(Math.random() * (pédiluve.length - 0 + 1))],
  });
});

router.get('/anime', async function(req, res) {
  const query = req.query.title
  if (!query) return res.status(400).json({ status: 400, error: 'No query was entered.' });
      
  const result = await kitsu.searchAnime(query);
  
  if (!result[0]) return res.json({
    success: 'false', 
    message: "Couldn't find this anime."
  });

  result[0].status = 200;
  res.status(200).json(result[0]);
});

router.get('/color/:hex', function(req, res) {
  const color = `#${req.params.hex}`;
  const hexRegex = new RegExp(/^#[0-9A-F]{6}$/i);
  if(!hexRegex.test(color)) return res.status(400).json({ status: 400, error: 'Invalid hex code. (Note: using # before the code will result into an error)' });

  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const png = canvas.toBuffer();

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': png.length,
  });

  res.end(png);
});

router.get('/translate', async function(req, res) {
  const to = req.query.to ?? 'en';
  const from = req.query.from ?? 'auto';
  const text = req.query.text;

  if (!text) return res.status(400).json({ status: 400, error: 'No text was entered.' });

  let tr;
  try {
    tr = await translate(text, {from, to});
  } catch (error) {
    return res.status(400).json({ status: 400, error: 'Invalid language code.' });
  }

  res.status(200).json({
    status: 200,
    from: {
      text: text,
      lang: languages[tr.from.language.iso],
      correctedText: tr.from.text.didYouMean ? tr.from.text.value : null,
    },
    to: {
      text: tr.text,
      lang: languages[tr.raw[1][1]],
    }
  })
})

module.exports = router;