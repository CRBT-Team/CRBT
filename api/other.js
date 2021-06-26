const { pédiluve } = require("../json/api.json");

module.exports = (app) => {
  app.get("/pediluve", function (req, res) {
    res.json({
      status: 200,
      image: pédiluve[Math.floor(Math.random() * (pédiluve.length - 0 + 1))],
    });
  });
};
