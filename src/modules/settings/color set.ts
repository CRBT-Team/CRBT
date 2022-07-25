import { colorAutocomplete } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { colors, db, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';

const { meta } = t('en-US', 'color set');

export const colorset = ChatCommand({
  name: 'color set',
  description: meta.description,
  options: new OptionBuilder().string('color', meta.options[0].description, {
    autocomplete({ color }) {
      return colorAutocomplete.call(this, color);
    },
    required: true,
  }),
  async handle({ color }) {
    const { strings, errors } = t(this, 'color set');

    const user = await this.client.users.fetch(this.user, { force: true });
    const text = color.toLowerCase().replaceAll(/ |#/g, '');
    const finalColor = colors[text] ? colors[text] : text;

    if (text.match(/^[0-9a-f]{6}$/) || colors[text]) {
      if (finalColor === colors.default) {
        cache.del(`color_${this.user.id}`);
        await db.users.upsert({
          create: { id: this.user.id, accentColor: null },
          update: { accentColor: null },
          where: { id: this.user.id },
        });
      } else {
        cache.set(`color_${user.id}`, `#${finalColor}`);
        await db.users.upsert({
          update: { accentColor: `#${finalColor}` },
          create: { id: this.user.id, accentColor: `#${finalColor}` },
          where: { id: user.id },
        });
      }
      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.EMBED_TITLE,
              iconURL: icons.success,
            })
            .setDescription(strings.EMBED_DESCRIPTION)
            .setColor(finalColor),
        ],
        ephemeral: true,
      });
    } else if (text === 'profile') {
      if (!user.hexAccentColor) {
        await this.reply({
          ...CRBTError(errors.NO_DISCORD_COLOR),
          components: components(
            row(
              new MessageButton()
                .setLabel('User Profile settings (desktop/web only)')
                .setURL('discord://-/settings/profile-customization')
                .setStyle('LINK')
            )
          ),
        });
      } else {
        cache.set(`color_${user.id}`, 'profile');
        await db.users.upsert({
          update: { accentColor: 'profile' },
          create: { id: this.user.id, accentColor: 'profile' },
          where: { id: user.id },
        });
        await this.reply({
          embeds: [
            new MessageEmbed()
              .setAuthor({
                name: strings.EMBED_TITLE,
                iconURL: icons.success,
              })
              .setDescription(`${strings.EMBED_SYNC_INFO} ${strings.EMBED_DESCRIPTION}`)
              .setColor(user.hexAccentColor),
          ],
          ephemeral: true,
        });
      }
    } else {
      await this.reply(CRBTError(errors.INVALID_COLOR_NAME));
    }
  },
});

// export const colorlist = ChatCommand({
//   name: 'color list',
//   description: 'Returns a list of CRBT accent color names and info.',
//   async handle() {
//     const { colorNames } = t(this, 'color set');

//     const userColor = await getColor(this.user);
//     const colorRows = [[], [], []];
//     const filteredColorsMap = colorsMap.filter(
//       (colorObj) => !(colorObj.private || colorObj.value === 'profile')
//     );

//     filteredColorsMap.forEach((colorObj) => {
//       let currentRow = 0;
//       const maxLength = Math.round(filteredColorsMap.length / 3);

//       if (colorRows[0].length >= maxLength) currentRow = 1;
//       if (colorRows[1].length >= maxLength) currentRow = 2;

//       colorRows[currentRow].push(`${colorObj.emoji} \`${colorNames[colorObj.key]}\``);
//     });

//     const img = canvas.createCanvas(512, 512);
//     const ctx = img.getContext('2d');
//     ctx.fillStyle = userColor;
//     ctx.fillRect(0, 0, img.width, img.height);
//     const e = new MessageEmbed()
//       .setAuthor({ name: 'CRBT Settings - Accent color', iconURL: icons.settings })
//       .setThumbnail(`attachment://color.png`)
//       .setDescription(
//         `**Current color:** \`${userColor}\`` +
//           '\n' +
//           "This color is used across most of CRBT's replies to you, as well as on your profile and info cards, when someone else visits them." +
//           '\n' +
//           'You can either choose one of these colors below or provide your own [HEX color value](https://htmlcolorcodes.com/color-picker/).' +
//           '\n' +
//           '**To change your accent color, use `/color set`**' +
//           '\n' +
//           'You can sync your CRBT accent color with your Discord profile color by using `/color set Sync Discord Profile Color`.'
//       )
//       .setColor(userColor);

//     colorRows.forEach((row) => {
//       if (row.length !== 0) e.addField('‎', row.join('\n'), true);
//     });

//     await this.reply({
//       embeds: [e],
//       files: [new MessageAttachment(img.toBuffer(), 'color.png')],
//       ephemeral: true,
//     });
//   },
// });
