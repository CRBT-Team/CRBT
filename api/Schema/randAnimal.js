const { Schema, model } = require("mongoose");

const reqStr = {
  required: true,
  type: String,
};

const animalSch = new Schema({
  animal: reqStr,
  name: reqStr,
  info: reqStr,
  image: reqStr,
});

module.exports = model("animal", animalSch);
