const { pédiluve } = require("../json/api.json");

module.exports = (app) => {
  app.get("/pediluve", function (req, res) {
    res.json({
      image: pédiluve[Math.floor(Math.random() * (pédiluve.length - 0 + 1))],
    });
  });
};
