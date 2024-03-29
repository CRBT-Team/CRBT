import { links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { MessageFlags } from 'discord-api-types/v10';
import { MessageButton } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'help',
  description: t('en-US', 'help.description'),
  nameLocalizations: getAllLanguages('HELP', localeLower),
  descriptionLocalizations: getAllLanguages('help.description'),
  async handle() {
    const showAdButton = !this.guild || this.guild.ownerId !== this.user.id;
    const introImage = 'https://s.clembs.com/w81xzTb.gif';

    await this.reply({
      embeds: [
        {
          author: {
            name: `${this.client.user.username} - ${t(this, 'HELP')}`,
            iconURL: avatar(this.client.user, 64),
          },
          description: t(this, 'HELP_DESCRIPTION', {
            prefix: '`/`',
            botIcon: '<:CRBT:860947227887403048>',
            reminder: slashCmd('reminder new'),
            settings: slashCmd('server settings'),
            infoCommands: new Intl.ListFormat(this.locale, { type: 'conjunction' }).format([
              slashCmd('search'),
              slashCmd('user info'),
              slashCmd('emoji info'),
            ]),
            link: links.discord,
          }),
          image: { url: introImage },
          color: await getColor(this.user),
          fields: showAdButton
            ? [
                {
                  name: t(this, 'HELP_AD_TITLE'),
                  value: t(this, 'HELP_AD_DESCRIPTION'),
                },
              ]
            : [],
        },
      ],
      flags: MessageFlags.Ephemeral,
      components: showAdButton
        ? components(
            row(
              new MessageButton()
                .setStyle('LINK')
                .setLabel(t(this, 'ADD_TO_SERVER'))
                .setURL(links.invite),
            ),
          )
        : null,
    });
  },
});
