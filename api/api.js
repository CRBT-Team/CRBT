const express = require("express");
const app = express();
const port = process.env.PORT;
const { links } = require("../index");
const { readdirSync, lstatSync } = require("fs");
// const { connect, connection } = require("mongoose");

app.get("/", async function (req, res) {
  res.json({
    status: 200,
    welcomeMessage: "Welcome to the Clembs API, currently in beta.",
    supportServer: links.info.discord,
    endpoints: {
      crbt: {
        method: "GET",
        description: "Retrieves info on CRBT & its latest version.",
      },
      "crbt/stats": {
        method: "GET",
        description: "Get member count, guild count & command count on CRBT.",
      },
      "crbt/meaning": {
        method: "GET",
        description: "wHaT dOeS cRbT mEan?????????2?",
      },
    },
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/*
connect(
  `mongodb+srv://CRBT:CRBT_Mongo_DB@crbt.pbnxb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (err) {
    if (err) return console.log(err.stack);
    console.log("Connected to MongoDB");
  }
);
*/
// Load all other api files
function loadAPIFiles(dir) {
  for (const file of readdirSync(dir).filter((file) => {
    return file !== "server.js";
  })) {
    const stat = lstatSync(`${dir}/${file}`);
    if (stat.isDirectory()) {
      loadAPIFiles(`${dir}/${file}`);
    } else if (file.endsWith(".js")) {
      const rFile = require(`${dir}/${file}`);
      app.use(`/${file.split(".")[0].trim().replace(/ /g, "-")}`, rFile);
    }
  }
}

loadAPIFiles(`${__dirname}/routes`);

app.set("json spaces", 2);

app
  .listen(12345, function () {
    console.log(`Connected to the Clembs API (https://localhost:12345)`);
  })
  .on("error", () => {
    console.log("Couldn't connect to Clembs API!");
  });
/*
process.on("exit", async function () {
  console.log("Stopping MongoDB connection");
  connection.close();
});

process.on("SIGINT", async function () {
  console.log("Stopping MongoDB connection");
  connection.close();
});
*/