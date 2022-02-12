const data = require('./anime.json');

const manga = data.data.filter(
  (manga) => !manga.attributes.tags.find((tag) => tag.attributes.name.en === 'Doujinshi')
)[0];

console.log(
  Object.entries(manga.attributes.links).filter(([, link]) =>
    link.match(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    )
  )[0]
);
