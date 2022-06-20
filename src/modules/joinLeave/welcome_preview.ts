import { colors, db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { GuildMember, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';
import { parseCRBTscriptInMessage, RawServerJoin } from './shared';

export default ChatCommand({
  name: 'welcome preview',
  description: t('en-US', 'JOINLEAVE_PREVIEW_DESCRIPTION').replace(
    '<TYPE>',
    t('en-US', 'JOIN_MESSAGE').toLowerCase()
  ),
  async handle() {
    const { joinChannel: channelId, joinMessage: message } = (await db.servers.findFirst({
      where: { id: this.guild.id },
      select: { joinChannel: true, joinMessage: true },
    })) as RawServerJoin;

    const { JUMP_TO_MSG } = t(this, 'genericButtons');

    if (!message) {
      return this.reply(
        CRBTError(
          t(this, 'JOIN_PREVIEW_ERROR_NO_MESSAGE')
            .replace('<TYPE>', t(this, 'JOIN_MESSAGE'))
            .toLowerCase()
        )
      );
    }
    if (!channelId) {
      return this.reply(
        CRBTError(
          t(this, 'JOIN_PREVIEW_ERROR_NO_CHANNEL')
            .replace('<TYPE>', t(this, 'JOIN_MESSAGE'))
            .toLowerCase()
        )
      );
    }

    try {
      const channel = this.guild.channels.resolve(channelId) as TextChannel;

      const parsedMessage = parseCRBTscriptInMessage(message, {
        channel,
        member: this.member as GuildMember,
      });

      const { url } = await channel.send({
        ...(parsedMessage.content ? { content: parsedMessage.content } : {}),
        embeds: [
          new MessageEmbed().setAuthor({
            name: t(this, 'JOINLEAVE_PREVIEW_EMBED_TITLE').replace(
              '<TYPE>',
              t(this, 'LEAVE_MESSAGE')
            ),
          }),
          new MessageEmbed(parsedMessage.embed),
        ],
      });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: t(this, 'JOINLEAVE_PREVIEW_EMBED_TITLE').replace(
                '<TYPE>',
                t(this, 'JOIN_MESSAGE')
              ),
              iconURL: this.guild.iconURL(),
            })
            .setDescription(
              t(this, 'JOINLEAVE_PREVIEW_EMBED_DESCRIPTION')
                .replace('<TYPE>', t(this, 'JOIN_MESSAGE'))
                .replace('<CHANNEL>', channel.toString())
            )
            .setColor(`#${colors.default}`),
        ],
        components: components(
          row(new MessageButton().setLabel(JUMP_TO_MSG).setURL(url).setStyle('LINK'))
        ),
      });
    } catch (e) {
      return this.reply(
        CRBTError(
          t(this, 'JOINLEAVE_PREVIEW_ERROR_UNKNOWN').replace('<TYPE>', t(this, 'JOIN_MESSAGE'))
        )
      );
    }
  },
});
