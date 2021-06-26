const { createCanvas } = require("canvas");

module.exports = (app) => {
  app.get("/color/:hex", function (req, res) {
    if (req.params.hex.length !== 6)
      return res.send("You must enter a valid HEX code of 6 digits (don't forget to remove the #).");

    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = `#${req.params.hex}`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const png = canvas.toBuffer();

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": png.length,
    });

    res.end(png);
  });
};
