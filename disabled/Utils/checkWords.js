module.exports = async (info) => {
  const bannedWords = require("../../json/sad/badwords.json").blockedWords;

  for (const word of bannedWords) {
    if (info.toLowerCase().includes(word.toLowerCase()))
      return Promise.reject({
        status: 406,
        error: `Info contains banned words.`,
      });
  }
};
