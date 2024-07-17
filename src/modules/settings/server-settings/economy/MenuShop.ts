import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { CategorySelectMenu } from './MenuCategory';
import { CreateCategoryButton } from './CreateCategoryButton';
import { economyNavBar } from './_navbar';

export const ShopButton = ButtonComponent({
  async handle() {
    const settings = await getGuildSettings(this.guildId);
    const { economy } = settings;

    await this.update({
      embeds: [
        {
          ...getGuildSettingsHeader(
            this.guild,
            settings,
            this.locale,
            `${t(this, EditableGuildFeatures.economy)} - Shop`,
          ),
          description: `Select a category using the dropdown below to edit it or view its items.`,
          fields: economy.categories.map((c) => ({
            name: `${c.emoji} ${c.label}`,
            value:
              c.items.length > 0
                ? c.items
                    .slice(0, 5)
                    .map((i) => `${i.emoji} ${i.name}`)
                    .join('\n') +
                  (c.items.length > 5
                    ? `\n${t(this, 'MORE_ELEMENTS', {
                        number: c.items.length - 5,
                      })}`
                    : '')
                : `No items`,
            inline: true,
          })),
        },
      ],
      components: components(
        economyNavBar(this, 'shop'),
        row(
          new CategorySelectMenu()
            .setPlaceholder('Categories')
            .setDisabled(!economy.categories.length)
            .setOptions(
              !economy.categories.length
                ? [
                    {
                      label: 'nothing to see here 👀',
                      value: 'null',
                    },
                  ]
                : economy.categories.map((c) => ({
                    label: c.label,
                    emoji: c.emoji,
                    value: c.id.toString(),
                    description: `${c.items.length.toLocaleString(this.locale)} items`,
                  })),
            ),
        ),
        row(
          new CreateCategoryButton()
            .setStyle('PRIMARY')
            .setEmoji(emojis.buttons.add)
            .setLabel('Create Category'),
        ),
      ),
    });
  },
});
