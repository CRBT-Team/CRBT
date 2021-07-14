const express = require("express");
const app = express();
const port = process.env.PORT;
const { links } = require("../index");
const { readdirSync, lstatSync } = require("fs");
const path = require("path");
// const { connect, connection } = require("mongoose");

app.get("/", async function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
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

app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        message: "Couldn't find this API endpoint.",
    });
});

app
    .listen(port, function () {
        if (require ('os').cpus()[0].model == "Intel(R) Xeon(R) CPU E5-2650 v4 @ 2.20GHz") {
            console.log(`Connected to Clembs API (http://api.clembs.xyz)`);
        }
        else {
            console.log(`Connected to the Clembs API (http://localhost:${port})`);
        }
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