import { colors } from '$lib/db';
import { MessageEmbed } from 'discord.js';
import { TextCommand } from 'purplet';

export default TextCommand({
  name: 'reply',
  async handle([id, ...message]) {
    // const channel = ((await this.client.channels.fetch(
    //   this.client.user.id === misc.CRBTid ? misc.channels.report : misc.channels.reportDev
    // )) as TextChannel).messages.fetch;
    const msg = await this.channel.messages.fetch(id);
    const embed = msg.embeds[0];
    await msg.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(embed.title)
          .setDescription(embed.description)
          .addFields(embed.fields ?? [{ name: 'Status', value: 'Pending' }])
          .addField(`Message from ${this.author.tag}`, message.join(' '))
          .setColor(`#${colors.yellow}`),
      ],
    });
    await this.delete();
  },
});
