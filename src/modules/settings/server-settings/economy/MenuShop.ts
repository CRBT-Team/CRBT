import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { CategorySelectMenu } from './MenuCategory';
import { CreateCategoryButton } from './CreateCategoryButton';
import { economyNavBar } from './_navbar';
import { invisibleChar } from '$lib/util/invisibleChar';

export const ShopButton = ButtonComponent({
  async handle() {
    const settings = await getGuildSettings(this.guildId);
    const { economy } = settings;
    const archivedItems = economy.items.filter(({ archived }) => !!archived);

    await this.update({
      content: invisibleChar,
      embeds: [
        {
          ...getGuildSettingsHeader(
            this.guild,
            settings,
            this.locale,
            `${t(this, EditableGuildFeatures.economy)} - Shop`,
          ),
          description: `Select a category using the dropdown below to edit it or view its items.`,
          fields: [
            ...economy.categories
              .sort((a, b) => (a.archived && !b.archived ? 1 : !a.archived && b.archived ? -1 : 0))
              .map((c) => {
                const items = c.items.filter(({ archived }) => !archived);

                return {
                  name: `${c.emoji} ${c.label} ${c.archived ? '[ARCHIVED]' : ''}`,
                  value:
                    items.length > 0
                      ? items
                          .slice(0, 5)
                          .map((i) => `${i.emoji} ${i.name}`)
                          .join('\n') +
                        (items.length > 5
                          ? `\n${t(this, 'MORE_ELEMENTS', {
                              number: items.length - 5,
                            })}`
                          : '')
                      : `No items`,
                  inline: true,
                };
              }),
            ...(archivedItems.length
              ? [
                  {
                    name: '🗃️ Archived items',
                    value:
                      archivedItems
                        .slice(0, 5)
                        .map((i) => `${i.emoji} ${i.name}`)
                        .join('\n') +
                      (archivedItems.length > 5
                        ? `\n${t(this, 'MORE_ELEMENTS', {
                            number: archivedItems.length - 5,
                          })}`
                        : ''),
                    inline: true,
                  },
                ]
              : []),
          ],
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
                : economy.categories
                    .sort((a, b) =>
                      a.archived && !b.archived ? 1 : !a.archived && b.archived ? -1 : 0,
                    )
                    .map((c) => ({
                      label: `${c.label} ${c.archived ? '[ARCHIVED]' : ''}`,
                      emoji: c.emoji,
                      value: c.id.toString(),
                      description: `${c.items.filter(({ archived }) => !archived).length.toLocaleString(this.locale)} items`,
                    })),
            )
            .addOptions(
              archivedItems.length
                ? [
                    {
                      label: 'Archived items',
                      value: 'archived',
                      emoji: '🗃️',
                      description: `${archivedItems.length.toLocaleString(this.locale)} items`,
                    },
                  ]
                : [],
            ),
        ),
        row(
          new CreateCategoryButton()
            .setStyle('PRIMARY')
            .setEmoji(emojis.buttons.add)
            .setLabel('Create Category')
            .setDisabled(economy.categories.length >= 10),
        ),
      ),
    });
  },
});
