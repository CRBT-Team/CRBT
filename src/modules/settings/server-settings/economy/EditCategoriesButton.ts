import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../_helpers';
import { BackSettingsButton } from '../settings';
import { CategorySelectMenu } from './CategorySelectMenu';
import { CreateCategoryButton } from './CreateCategoryButton';

export const EditCategoriesButton = ButtonComponent({
  async handle() {
    const { economy } = await getGuildSettings(this.guildId);

    await this.update({
      embeds: [
        {
          title: `${t(this, EditableGuildFeatures.economy)} - Shop`,
          // ...getGuildSettingsHeader(this.locale, accentColor, [
          //   this.guild.name,
          //   t(this, EditableGuildFeatures.economy),
          //   'Shop',
          // ]),
          fields: economy.categories.map((c) => ({
            name: `${c.emoji} ${c.label}`,
            value: `${c.items.length.toLocaleString(this.locale)} items`,
            inline: true,
          })),
        },
      ],
      components: components(
        row(
          new BackSettingsButton(EditableGuildFeatures.economy)
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('SECONDARY'),
          new CreateCategoryButton().setStyle('PRIMARY').setLabel('Create Category'),
        ),
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
      ),
    });
  },
});
