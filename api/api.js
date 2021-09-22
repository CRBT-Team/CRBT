const express = require("express");
const app = express();
const port = process.env.PORT;
const { links } = require("..");
const { readdirSync, lstatSync } = require("fs");
const path = require("path");
// const { connect, connection } = require("mongoose");

app.get("/", async function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        console.log(`Connected to the Clembs API (http://localhost:${port})`);
    })
    .on("error", () => {
        console.log("Couldn't connect to Clembs API!");
    });