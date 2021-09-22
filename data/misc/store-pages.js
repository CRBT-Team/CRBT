const { emojis, items, links } = require("../..");
const bd = items.badges; const bn = items.banners
const baseURL = links.banners
const p = {
  familiar: 'Familiar faces',
  flags: 'Flags',
  jobs: 'Jobs',
  emotions: 'Emotions',
  season3: 'Season 3 banners'
};

module.exports.badges = `

{field:${p.familiar}:
${bd.goodmeal.contents} ${bd.goodmeal.name}\n**${emojis.purplet} ${bd.goodmeal.value} Purplets**
\`<prefix>buy badge goodmeal\`
—
${bd.udu.contents} ${bd.udu.name}\n**${emojis.purplet} ${bd.udu.value} Purplets**
\`<prefix>buy badge udu\`
:yes}

{field:${p.flags}:
${bd.france.contents} ${bd.france.name}\n**${emojis.purplet} ${bd.france.value} Purplets**
\`<prefix>buy badge france\`
—
${bd.usa.contents} ${bd.usa.name}\n**${emojis.purplet} ${bd.usa.value} Purplets**
\`<prefix>buy badge usa\`
—
${bd.russia.contents} ${bd.russia.name}\n**${emojis.purplet} ${bd.russia.value} Purplets**
\`<prefix>buy badge russia\`
—
${bd.brazil.contents} ${bd.brazil.name}\n**${emojis.purplet} ${bd.brazil.value} Purplets**
\`<prefix>buy badge brazil\`
—
${bd.poland.contents} ${bd.poland.name}\n**${emojis.purplet} ${bd.poland.value} Purplets**
\`<prefix>buy badge poland\`
:yes}

{field:${p.jobs}:
${bd.developer.contents} ${bd.developer.name}\n**${emojis.purplet} ${bd.developer.value} Purplets**
\`<prefix>buy badge developer\`
—
${bd.doctor.contents} ${bd.doctor.name}\n**${emojis.purplet} ${bd.doctor.value} Purplets**
\`<prefix>buy badge doctor\`
—
${bd.musician.contents} ${bd.musician.name}\n**${emojis.purplet} ${bd.musician.value} Purplets**
\`<prefix>buy badge musician\`
—
${bd.illustrator.contents} ${bd.illustrator.name}\n**${emojis.purplet} ${bd.illustrator.value} Purplets**
\`<prefix>buy badge illustrator\`
:yes}
`;

module.exports.badges2 = `

{field:${p.emotions}:
${bd.flushed.contents} ${bd.flushed.name}\n**${emojis.purplet} ${bd.flushed.value} Purplets**
\`<prefix>buy badge flushed\`
—
${bd.joy.contents} ${bd.joy.name}\n**${emojis.purplet} ${bd.joy.value} Purplets**
\`<prefix>buy badge joy\`
—
${bd.smile.contents} ${bd.smile.name}\n**${emojis.purplet} ${bd.smile.value} Purplets**
\`<prefix>buy badge smile\`
—
${bd.thinking.contents} ${bd.thinking.name}\n**${emojis.purplet} ${bd.thinking.value} Purplets**
\`<prefix>buy badge thinking\`
:yes}

{field:—:
${bd.winktongue.contents} ${bd.winktongue.name}\n**${emojis.purplet} ${bd.winktongue.value} Purplets**
\`<prefix>buy badge winktongue\`
—
${bd.starstruck.contents} ${bd.starstruck.name}\n**${emojis.purplet} ${bd.starstruck.value} Purplets**
\`<prefix>buy badge starstruck\`
—
${bd.pensive.contents} ${bd.pensive.name}\n**${emojis.purplet} ${bd.pensive.value} Purplets**
\`<prefix>buy badge pensive\`
—
${bd.wink.contents} ${bd.wink.name}\n**${emojis.purplet} ${bd.wink.value} Purplets**
\`<prefix>buy badge wink\`
:yes}
`;

module.exports.banners = `

{field:${p.season3}:
**• [${bn.flower.name}](${baseURL}/${bn.flower.contents})**\n**${emojis.purplet} ${bn.flower.value} Purplets**
\`<prefix>buy banner flower\`
—
**• [${bn.cake.name}](${baseURL}/${bn.cake.contents})**\n**${emojis.purplet} ${bn.cake.value} Purplets**
\`<prefix>buy banner cake\`
—
**• [${bn.mountain.name}](${baseURL}/${bn.mountain.contents})**\n**${emojis.purplet} ${bn.mountain.value} Purplets**
\`<prefix>buy banner mountain\`
—
**• [${bn.stripes.name}](${baseURL}/${bn.stripes.contents})**\n**${emojis.purplet} ${bn.stripes.value} Purplets**
\`<prefix>buy banner stripes\`
:yes}

{field:—:
**• [${bn.blood.name}](${baseURL}/${bn.blood.contents})**\n**${emojis.purplet} ${bn.blood.value} Purplets**
\`<prefix>buy banner blood\`
—
**• [${bn.space.name}](${baseURL}/${bn.space.contents})**\n**${emojis.purplet} ${bn.space.value} Purplets**
\`<prefix>buy banner space\`
—
**• [${bn.bubbles.name}](${baseURL}/${bn.bubbles.contents})**\n**${emojis.purplet} ${bn.bubbles.value} Purplets**
\`<prefix>buy banner bubbles\`
:yes}
`;