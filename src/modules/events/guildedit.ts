import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { imgDominantColor } from '$lib/functions/imgDominantColor';
import { OnEvent } from 'purplet';
import { getSettings, include } from '../settings/serverSettings/_helpers';

export default OnEvent('guildUpdate', async (oldGuild, newGuild) => {
  if (oldGuild.icon === newGuild.icon) return;

  const { automaticTheming } = await getSettings(newGuild.id);

  if (!automaticTheming) return;

  const guildIcon = newGuild.iconURL({ format: 'png' });
  const dominantColor = (await imgDominantColor(guildIcon)).num();

  await fetchWithCache(
    `${newGuild.id}:settings`,
    () =>
      prisma.servers.upsert({
        where: { id: newGuild.id },
        create: {
          id: newGuild.id,
          iconHash: newGuild.icon,
          accentColor: dominantColor,
        },
        update: {
          iconHash: newGuild.icon,
          accentColor: dominantColor,
        },
        include,
      }),
    true
  );
});

// export const test = TextCommand({
//   name: 'test',
//   async handle() {
//     const { accentColor: accent } = await getSettings(this.guildId);

//     const [accentH, accentS, accentL] = chroma(accent).hsl();

//     console.table({
//       accentH,
//       accentS,
//       accentL,
//     });

//     this.reply({
//       embeds: [
//         {
//           author: {
//             name: 'hi',
//             icon_url: icon(accent, 'settings', 'image'),
//           },
//           thumbnail: {
//             url: this.guild.iconURL(),
//           },
//           description: `**${icon(accent, 'thumbsup')} 1 • ${icon(accent, 'thumbsdown')} 3**`,
//           color: accent,
//         },
//       ],
//       components: components(
//         row({
//           type: 'BUTTON',
//           label: 'Button',
//           emoji: icon(accent, 'toggleon'),
//           style: 'SECONDARY',
//           customId: 'h',
//         })
//       ),
//     });
//   },
// });
