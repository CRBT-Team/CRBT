import { colors, db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { GuildMember, MessageButton, MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';
import { parseCRBTscriptInMessage, RawServerLeave } from './shared';

export default ChatCommand({
  name: 'farewell preview',
  description: t('en-US', 'JOINLEAVE_PREVIEW_DESCRIPTION').replace(
    '<TYPE>',
    t('en-US', 'LEAVE_MESSAGE').toLowerCase()
  ),
  async handle() {
    const data = (await db.servers.findFirst({
      where: { id: this.guild.id },
      select: { leaveChannel: true, leaveMessage: true },
    })) as RawServerLeave;

    const { JUMP_TO_MSG } = t(this, 'genericButtons');

    if (!data) {
      return this.reply(
        CRBTError(
          t(this, 'LEAVE_PREVIEW_ERROR_NO_MESSAGE')
            .replace('<TYPE>', t(this, 'LEAVE_MESSAGE'))
            .toLowerCase()
        )
      );
    }

    const { leaveChannel: channelId, leaveMessage: message } = data;

    if (!channelId) {
      return this.reply(
        CRBTError(
          t(this, 'LEAVE_PREVIEW_ERROR_NO_CHANNEL')
            .replace('<TYPE>', t(this, 'LEAVE_MESSAGE'))
            .toLowerCase()
        )
      );
    }

    console.log(message);

    try {
      const channel = this.guild.channels.resolve(channelId) as TextChannel | NewsChannel;

      const parsedMessage = parseCRBTscriptInMessage(message, {
        channel,
        member: this.member as GuildMember,
      });

      const { url } = await channel.send({
        ...(parsedMessage.content ? { content: parsedMessage.content } : {}),
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: t(this, 'JOINLEAVE_PREVIEW_EMBED_TITLE').replace(
                '<TYPE>',
                t(this, 'LEAVE_MESSAGE')
              ),
            })
            .setColor(`#${colors.default}`),
          ...(message.embed ? [new MessageEmbed(parsedMessage.embed)] : []),
        ],
      });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: t(this, 'JOINLEAVE_PREVIEW_EMBED_TITLE').replace(
                '<TYPE>',
                t(this, 'LEAVE_MESSAGE')
              ),
              iconURL: this.guild.iconURL(),
            })
            .setDescription(
              t(this, 'JOINLEAVE_PREVIEW_EMBED_DESCRIPTION')
                .replace('<TYPE>', t(this, 'LEAVE_MESSAGE'))
                .replace('<CHANNEL>', channel.toString())
            )
            .setColor(`#${colors.default}`),
        ],
        components: components(
          row(new MessageButton().setLabel(JUMP_TO_MSG).setURL(url).setStyle('LINK'))
        ),
      });
    } catch (e) {
      console.error(e);
      return this.reply(
        CRBTError(
          t(this, 'JOINLEAVE_PREVIEW_ERROR_UNKNOWN').replace('<TYPE>', t(this, 'LEAVE_MESSAGE'))
        )
      );
    }
  },
});
