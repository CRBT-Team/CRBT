import { colorAutocomplete } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getAllLanguages, t } from '$lib/language';
import { AchievementProgress } from '$lib/responses/Achievements';
import { ChatCommand, OptionBuilder } from 'purplet';

const meta = {
  descriptions: getAllLanguages('color set.meta.description'),
  options: getAllLanguages('color set.meta.options' as any),
};

export const colorset = ChatCommand({
  name: 'color set',
  description: meta.descriptions['en-US'],
  descriptionLocalizations: meta.descriptions,
  options: new OptionBuilder().string('color', meta.options['en-US'][0].name, {
    autocomplete({ color }) {
      return colorAutocomplete.call(this, color);
    },
    nameLocalizations: Object.entries(meta.options).reduce((acc, [lang, obj]) => {
      console.log(lang, obj);
      return {
        ...acc,
        [lang]: obj[0].name.replaceAll(' ', '-'),
      };
    }, {}),
    // descriptionLocalizations: Object.entries(meta.options).reduce(
    //   (acc, [lang, obj]) => ({
    //     ...acc,
    //     [lang]: obj[0].description,
    //   }),
    //   {}
    // ),
    required: true,
  }),
  async handle({ color: colorHex }) {
    const { strings, errors } = t(this, 'color set');

    const user = await this.user.fetch();
    colorHex = colorHex.toLowerCase().replace(/ |#/g, '');

    const color = colors[colorHex] ?? parseInt(colorHex, 16);

    if (/^[0-9a-f]{6}$/.test(colorHex) || colors[colorHex]) {
      if (color === colors.default) {
        cache.del(`${this.user.id}:color`);
        await prisma.user.upsert({
          create: { id: this.user.id, accentColor: null },
          update: { accentColor: null },
          where: { id: this.user.id },
        });
      } else {
        cache.set(`${user.id}:color`, color);
        await prisma.user.upsert({
          update: { accentColor: color },
          create: { id: this.user.id, accentColor: color },
          where: { id: user.id },
        });
      }
      await this.reply({
        embeds: [
          {
            title: `${emojis.success} ${strings.EMBED_TITLE}`,
            description: strings.EMBED_DESCRIPTION,
            color,
          },
        ],
        ephemeral: true,
      });

      await AchievementProgress.call(this, 'ARTIST');

      if (colorHex.toLowerCase().trim() === 'clembs') {
        await AchievementProgress.call(this, 'IMITATING_THE_CREATOR');
      }
    } else if (color === 0) {
      if (!user.hexAccentColor) {
        await CRBTError(this, errors.NO_DISCORD_COLOR);
      } else {
        cache.set(`color_${user.id}`, 'profile');
        await prisma.user.upsert({
          update: { accentColor: color },
          create: { id: this.user.id, accentColor: color },
          where: { id: user.id },
        });
        await this.reply({
          embeds: [
            {
              title: `${emojis.success} ${strings.EMBED_TITLE}`,
              color: user.accentColor,
              description: `${strings.EMBED_SYNC_INFO} ${strings.EMBED_DESCRIPTION}`,
            },
          ],
          ephemeral: true,
        });

        await AchievementProgress.call(this, 'ARTIST');
      }
    } else {
      await CRBTError(this, errors.INVALID_COLOR_NAME);
    }
  },
});
