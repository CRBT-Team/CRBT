import { colorAutocomplete } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { ChatCommand, OptionBuilder } from 'purplet';

export const colorset = ChatCommand({
  name: 'color set',
  description: t('en-US', 'color set.meta.description'),
  descriptionLocalizations: getAllLanguages('color set.meta.description'),
  options: new OptionBuilder().string(
    'color',
    t('en-US', 'color set.meta.options.0.description' as any),
    {
      autocomplete({ color }) {
        return colorAutocomplete.call(this, color);
      },
      nameLocalizations: getAllLanguages('color set.meta.options.0.name' as any, localeLower),
      descriptionLocalizations: getAllLanguages('color set.meta.options.0.description' as any),
      required: true,
    }
  ),
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
      }
    } else {
      await CRBTError(this, t(this, 'ERROR_INVALID_COLOR'));
    }
  },
});
