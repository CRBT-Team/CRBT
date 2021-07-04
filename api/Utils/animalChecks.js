const Animals = require("../Schema/Animal");

module.exports = async (animal) => {
  const fAnimal = await Animals.findOne({ animal: animal });

  if (!fAnimal)
    return Promise.reject({
      status: 404,
      error: `Couldn't find that type of animal.`,
    });
};
