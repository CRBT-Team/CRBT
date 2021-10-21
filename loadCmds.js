module.exports = () => {
  const { readdirSync, statSync } = require('fs-extra');
  const { bot } = require('./index');
  let dir = readdirSync(`${__dirname}/src`);
  let i = 0;

  handler: while (i < dir.length) {
    const stat = statSync(`./src/${dir[i]}`);

    if (stat.isDirectory()) {
      const readdir = readdirSync(`./src/${dir[i]}`);

      let nums = 0;
      while (nums < readdir.length) {
        dir.push(`${dir[i]}/${readdir[nums]}`);
        nums++;
      }
      i++;
      continue handler;
    } else if (stat.isFile()) {
      const command = require(`./src/${dir[i]}`);
      try {
        bot[Object.keys(command)[0]](command[Object.keys(command)[0]]);
        i++;
        continue handler;
      } catch (err) {
        console.error(err.message);
        delete dir[i];

        continue handler;
      }
    } else {
      console.error('Directory was not a Folder or File');
      delete dir[i];

      continue handler;
    }
  }
};