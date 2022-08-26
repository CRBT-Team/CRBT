import { colorAutocomplete } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { colors, db, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { AchievementProgress } from '$lib/responses/Achievements';
import { MessageEmbed } from 'discord.js';
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

    if (/^[0-9a-f]{6}$/.test(colorHex) || colors[colorHex]) {
      if (color === colors.default) {
        cache.del(`${this.user.id}:color`);
        await db.users.upsert({
          create: { id: this.user.id, accentColor: null },
          update: { accentColor: null },
          where: { id: this.user.id },
        });
      } else {
        cache.set(`${user.id}:color`, `#${color}`);
        await db.users.upsert({
          update: { accentColor: `#${color}` },
          create: { id: this.user.id, accentColor: `#${color}` },
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
            .setColor(color),
        ],
        ephemeral: true,
      });

      await AchievementProgress.call(this, 'ARTIST');

      if (colorHex.toLowerCase().trim() === 'clembs') {
        await AchievementProgress.call(this, 'IMITATING_THE_CREATOR');
      }
    } else if (colorHex === 'profile') {
      if (!user.hexAccentColor) {
        await this.reply(CRBTError(errors.NO_DISCORD_COLOR));
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

        await AchievementProgress.call(this, 'ARTIST');
      }
    } else {
      await this.reply(CRBTError(errors.INVALID_COLOR_NAME));
    }
  },
});
