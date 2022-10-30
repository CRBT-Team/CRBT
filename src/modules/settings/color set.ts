import { colorAutocomplete } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { AchievementProgress } from '$lib/responses/Achievements';
import { ChatCommand, OptionBuilder } from 'purplet';

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
  async handle({ color: colorHex }) {
    const { strings, errors } = t(this, 'color set');

    const user = await this.user.fetch();
    colorHex = colorHex.toLowerCase().replace(/ |#/g, '');
    const color = colors[colorHex] ?? colorHex;
    const colorInt = parseInt(color, 16);

    if (/^[0-9a-f]{6}$/.test(colorHex) || colors[colorHex]) {
      if (colorInt === colors.default) {
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
            title: `${emojis.success} ${strings.EMBED_TITLE}.`,
            color: color,
            description: strings.EMBED_DESCRIPTION,
          },
        ],
        ephemeral: true,
      });

      await AchievementProgress.call(this, 'ARTIST');

      if (colorHex.toLowerCase().trim() === 'clembs') {
        await AchievementProgress.call(this, 'IMITATING_THE_CREATOR');
      }
    } else if (colorHex === 'profile') {
      if (!user.hexAccentColor) {
        await CRBTError(this, errors.NO_DISCORD_COLOR);
      } else {
        cache.set(`color_${user.id}`, 'profile');
        await prisma.user.upsert({
          update: { accentColor: 0 },
          create: { id: this.user.id, accentColor: 0 },
          where: { id: user.id },
        });
        await this.reply({
          embeds: [
            {
              title: `${emojis.success} ${strings.EMBED_TITLE}.`,
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
