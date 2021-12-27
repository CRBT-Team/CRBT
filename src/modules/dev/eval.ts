import * as all from '$lib/db';
import { colors, emojis, illustrations } from '$lib/db';
import { MessageEmbed, Team } from 'discord.js';
import { TextCommand } from 'purplet';

export default TextCommand({
  name: 'eval',
  async handle(args) {
    if (this.author.id !== ((await this.client.application.fetch()).owner as Team).ownerId) {
      this.reply('shush');
    } else {
      const evaluation =
        `
        const db = ${all};
        const This = {
          channel: ${JSON.stringify(this)},
          client: ${JSON.stringify(this.client)},
          author: ${JSON.stringify(this.author)},
          guild: ${JSON.stringify(this.guild)},
          member: ${JSON.stringify(this.member)},
        }
        ` + args.join(' ').replaceAll('```', '').replace('ts', '').replace('js', '');
      try {
        (0, eval)(evaluation);
        this.react('🏳');
      } catch (error) {
        this.react('❌');
        this.reply({
          embeds: [
            new MessageEmbed()
              .setAuthor(`Error ${emojis.other.angry_pink}`, illustrations.error)
              .setDescription(`\`\`\`\n${error}\`\`\``)
              .setColor(`#${colors.red}`),
          ],
        });
      }
    }
  },
});
