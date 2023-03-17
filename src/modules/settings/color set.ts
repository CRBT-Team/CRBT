import { colorAutocomplete } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import chroma from 'chroma-js';
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
      nameLocalizations: getAllLanguages('COLOR', localeLower),
      descriptionLocalizations: getAllLanguages('color set.meta.options.0.description' as any),
      required: true,
    }
  ),
  async handle({ color: colorRaw }) {
    colorRaw = colorRaw.toLowerCase().replace(/ |#/g, '');

    console.log(chroma.valid(parseInt(colorRaw) ?? colorRaw));

    if (colors[colorRaw] === undefined && !chroma.valid(parseInt(colorRaw) ?? colorRaw)) {
      return CRBTError(this, t(this, 'ERROR_INVALID_COLOR'));
    }

    const color: number = colors[colorRaw] ?? chroma(parseInt(colorRaw) ?? colorRaw).num();

    if (color === colors.default) {
      cache.del(`${this.user.id}:color`);
      await prisma.user.upsert({
        create: { id: this.user.id, accentColor: null },
        update: { accentColor: null },
        where: { id: this.user.id },
      });
    } else {
      cache.set(`${this.user.id}:color`, color);
      await prisma.user.upsert({
        update: { accentColor: color },
        create: { id: this.user.id, accentColor: color },
        where: { id: this.user.id },
      });
    }

    if (color === colors.sync) {
      const user = await this.user.fetch();
      if (!user.hexAccentColor) {
        CRBTError(this, t(this, 'color set.errors.NO_DISCORD_COLOR'));
        return;
      }

      this.reply({
        embeds: [
          {
            title: `${emojis.success} ${t(this, 'color set.strings.EMBED_TITLE')}`,
            description: `${t(this, 'color set.strings.EMBED_SYNC_INFO')} ${t(
              this,
              'color set.strings.EMBED_DESCRIPTION'
            )}`,
            color: user.accentColor,
          },
        ],
        ephemeral: true,
      });
      return;
    }

    this.reply({
      embeds: [
        {
          title: `${emojis.success} ${t(this, 'color set.strings.EMBED_TITLE')}`,
          description: t(this, 'color set.strings.EMBED_DESCRIPTION'),
          color,
        },
      ],
      ephemeral: true,
    });
  },
});
