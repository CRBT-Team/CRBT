const express = require("express");
const app = express();
const port = process.env.PORT;
const { links } = require("../index");
const { readdirSync, lstatSync } = require("fs");

app.get("/", function (req, res) {
  res.json({
    status: 200,
    welcomeMessage: "Welcome to the Clembs API, currently in beta.",
    supportServer: links.info.discord,
    endpoints: {
      "crbt": {
        method: "GET",
        description: "Retrieves info on CRBT & its latest version.",
      },
      "crbt/stats": {
        method: "GET",
        description: "Get CRBT's member count, server count & command count.",
      },
      "crbt/meaning": {
        method: "GET",
        description: "wHaT dOeS cRbT mEan?????????2?",
      },
      "color": {
        method: "GET",
        usage: "color/:hex (where :hex is a valid HEX color code (with the #))",
        description: "Returns an image of the chosen HEX color."
      },
    },
  });
});

function loadAPIFiles(dir) {
  for (const file of readdirSync(dir).filter((file) => {
    return file !== "api.js";
  })) {
    const stat = lstatSync(`${dir}/${file}`);
    if (stat.isDirectory()) {
      loadAPIFiles(`${dir}/${file}`)
    } else if (file.endsWith(".js")) {
      require(`${dir}/${file}`)(app);
    }
  }
}

loadAPIFiles(__dirname);

app.set("json spaces", 2);

app
  .listen(port, () => {
    if (port === 15019) {
      console.log(`Connected to the Clembs API (https://api.clembs.xyz)`);
    } else {
      console.log(`Connected to the Clembs API (http://localhost:${port})`);
    }
  })
  .on("error", () => {
    app
      .listen(15019, function () {
        console.log(`Connected to the Clembs API (https://localhost:15019)`);
      })
      .on("error", () => {
        console.log("Couldn't connect to Clembs API!");
      });
  });
