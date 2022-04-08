import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { languages } from '$lib/language';
import { GuildChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, MessageContextCommand, row } from 'purplet';

const { ctxMeta } = languages['en-US'].bookmark;

export default MessageContextCommand({
  ...ctxMeta,
  async handle(message) {
    const { strings, errors } = languages[this.locale].bookmark;
    const { JUMP_TO_MSG } = languages[this.locale].genericButtons;

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
            .setColor(message.member.displayColor)
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
            row(
              new MessageButton().setLabel(strings.SUCCESS_BUTTON).setStyle('LINK').setURL(msg.url)
            )
          ),
          ephemeral: true,
        });
      })
      .catch(() => {
        return this.reply(CRBTError(errors.DMS_DISABLED));
      });
  },
});
