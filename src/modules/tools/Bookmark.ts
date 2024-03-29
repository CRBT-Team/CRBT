import { colors } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { formatUsername } from '$lib/functions/formatUsername';
import { t } from '$lib/language';
import { GuildChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, MessageContextCommand, row } from 'purplet';

const { ctxMeta } = t('en-US', 'bookmark');

export default MessageContextCommand({
  ...ctxMeta,
  async handle(message) {
    const { strings, errors } = t(this, 'bookmark');

    await this.user
      .send({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.BOOKMARK_AUTHOR.replace('{USER}', formatUsername(message.author)),
              iconURL: avatar(message.author, 64),
            })
            .setDescription(message.content)
            .setImage(message.attachments.size ? message.attachments.first().proxyURL : undefined)
            .setTimestamp(message.createdAt)
            .setFooter({
              text: `${this.guild.name} • #${(message.channel as GuildChannel).name}`,
            })
            .setColor(message.member?.displayColor ?? colors.blurple)
            .setURL(message.url),
          ...message.embeds,
        ],
        components: components(
          row(
            new MessageButton()
              .setLabel(t(this, 'JUMP_TO_MSG'))
              .setStyle('LINK')
              .setURL(message.url)
          )
        ),
      })
      .then((msg) => {
        this.reply({
          content: strings.SUCCESS_MESSAGE,
          components: components(
            row(new MessageButton().setLabel(t(this, 'OPEN_DMS')).setStyle('LINK').setURL(msg.url))
          ),
          ephemeral: true,
        });
      })
      .catch(async () => await CRBTError(this, errors.DMS_DISABLED));
  },
});
