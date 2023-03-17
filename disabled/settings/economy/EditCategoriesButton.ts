import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableFeatures } from '$lib/types/settings';
import { ButtonComponent, components, row } from 'purplet';
import { BackSettingsButton } from '../../../src/modules/settings/serverSettings/settings';
import {
  getSettings,
  getSettingsHeader,
} from '../../../src/modules/settings/serverSettings/_helpers';
import { CategorySelectMenu } from './CategorySelectMenu';
import { CreateCategoryButton } from './CreateCategoryButton';

export const EditCategoriesButton = ButtonComponent({
  async handle() {
    const { economy, accentColor } = await getSettings(this.guildId);

    await this.update({
      embeds: [
        {
          ...getSettingsHeader(this.locale, accentColor, [
            this.guild.name,
            t(this, EditableFeatures.economy),
            'Shop',
          ]),
          fields: economy.categories.map((c) => ({
            name: `${c.emoji} ${c.label}`,
            value: `${c.items.length.toLocaleString(this.locale)} items`,
            inline: true,
          })),
        },
      ],
      components: components(
        row(
          new BackSettingsButton(EditableFeatures.economy)
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('SECONDARY'),
          new CreateCategoryButton().setStyle('PRIMARY').setLabel('Create Category')
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
                  }))
            )
        )
      ),
    });
  },
});
