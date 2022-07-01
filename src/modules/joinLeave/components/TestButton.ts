import { GuildMember } from 'discord.js';
import { ButtonComponent } from 'purplet';
import { joinBuilderCache } from '../renderers';
import { parseCRBTscriptInMessage } from '../utility/parseCRBTscriptInMessage';

export const TestButton = ButtonComponent({
  async handle() {
    const parsed = parseCRBTscriptInMessage(joinBuilderCache.get(this.guildId), {
      channel: this.channel,
      member: this.member as GuildMember,
    });

    await this.reply({
      allowedMentions: {
        users: [this.user.id],
      },
      content: parsed.content,
      embeds: parsed.embed ? [parsed.embed] : [],
      ephemeral: true,
    });
  },
});
