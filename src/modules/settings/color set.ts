import { colorAutocomplete } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { colors, db, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { AchievementProgress } from '$lib/responses/Achievements';
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

      await AchievementProgress.call(this, 'ARTIST');

      if (color.toLowerCase().trim() === 'clembs') {
        await AchievementProgress.call(this, 'IMITATING_THE_CREATOR');
      }
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

        await AchievementProgress.call(this, 'ARTIST');
      }
    } else {
      await this.reply(CRBTError(errors.INVALID_COLOR_NAME));
    }
  },
});
