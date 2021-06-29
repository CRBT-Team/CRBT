const { Schema, model } = require("mongoose");

const uReqStr = {
  required: true,
  type: String
};

const animalSch = new Schema({
  animal: {
    required: true,
    type: String,
  },
  name: uReqStr,
  info: uReqStr,
  image: uReqStr,
});

module.exports = model("animal", animalSch);
