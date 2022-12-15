import { links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { MessageButton } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'help',
  description: 'Returns a quick help guide for CRBT.',
  nameLocalizations: getAllLanguages('help.name', localeLower),
  descriptionLocalizations: getAllLanguages('help.description'),
  async handle() {
    const showAdButton = !this.guild || this.guild.ownerId !== this.user.id;
    const introImage = 'https://i.imgur.com/rUHqMcy.gif';

    await this.reply({
      embeds: [
        {
          author: {
            name: t(this, 'HELP_TITLE', {
              botName: this.client.user.username,
            }),
            iconURL: avatar(this.client.user, 64),
          },
          description: t(this, 'HELP_DESCRIPTION', {
            prefix: '`/`',
            botIcon: '<:CRBT:860947227887403048>',
            reminder: slashCmd('reminder new'),
            settings: slashCmd('settings'),
            infoCommands: [slashCmd('search'), slashCmd('user info'), slashCmd('define')].join(
              ', '
            ),
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
      components: showAdButton
        ? components(
            row(
              new MessageButton()
                .setStyle('LINK')
                .setLabel(t(this, 'ADD_TO_SERVER'))
                .setURL(links.invite)
            )
          )
        : null,
    });
  },
});
