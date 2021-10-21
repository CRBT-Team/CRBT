const express = require('express');
const app = express();
const port = process.env.PORT;
const { readdirSync, lstatSync } = require('fs-extra');
const { join } = require('path');

app.get('/', function (req, res) {
  res.sendFile(join(__dirname, 'index.html'));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);

// Load all other api files
function loadAPIFiles(dir) {
  for (const file of readdirSync(dir).filter((file) => file !== 'server.js' )) {
    const stat = lstatSync(`${dir}/${file}`);
    if (stat.isDirectory()) loadAPIFiles(`${dir}/${file}`);
    else if (file.endsWith('.js')) {
      const rFile = require(`${dir}/${file}`);
      app.use(`/${file.split('.')[0].trim().replace(/ /g, '-')}`, rFile);
    }
  }
}

loadAPIFiles(`${__dirname}/routes`);


app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Couldn't find this API endpoint.",
  });
});

app.listen(port, () => { console.log(`Connected to the Clembs API (http://localhost:${port})`) })
app.on('error', () => { console.log("Couldn't connect to Clembs API!") });