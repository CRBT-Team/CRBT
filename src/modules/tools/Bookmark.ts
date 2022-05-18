import { colors } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { getStrings } from '$lib/language';
import { GuildChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, MessageContextCommand, row } from 'purplet';

const { ctxMeta } = getStrings('en-US', 'bookmark');

export default MessageContextCommand({
  ...ctxMeta,
  async handle(message) {
    const { strings, errors } = getStrings(this.locale, 'bookmark');
    const { JUMP_TO_MSG, OPEN_DMS } = getStrings(this.locale, 'genericButtons');

    await this.user
      .send({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.BOOKMARK_AUTHOR.replace('<USER>', message.author.tag),
              iconURL: avatar(message.author, 64),
            })
            .setDescription(message.content)
            .setImage(message.attachments.size ? message.attachments.first().proxyURL : undefined)
            .setTimestamp(message.createdAt)
            .setFooter({
              text: `${this.guild.name} • #${(message.channel as GuildChannel).name}`,
            })
            .setColor(message.member.displayColor ?? `#${colors.blurple}`)
            .setURL(message.url),
          ...message.embeds,
        ],
        components: components(
          row(new MessageButton().setLabel(JUMP_TO_MSG).setStyle('LINK').setURL(message.url))
        ),
      })
      .then((msg) => {
        this.reply({
          content: strings.SUCCESS_MESSAGE,
          components: components(
            row(new MessageButton().setLabel(OPEN_DMS).setStyle('LINK').setURL(msg.url))
          ),
          ephemeral: true,
        });
      })
      .catch(() => {
        return this.reply(CRBTError(errors.DMS_DISABLED));
      });
  },
});
