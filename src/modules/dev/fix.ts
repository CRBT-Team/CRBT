import { colors, emojis, links } from '$lib/db';
import { button } from '$lib/functions/button';
import { MessageActionRow, MessageEmbed } from 'discord.js';
import { TextCommand } from 'purplet';

export default TextCommand({
  name: 'fix',
  async handle([id, ...message]) {
    const msg = await this.channel.messages.fetch(id);
    const embed = msg.embeds[0];
    await msg.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(embed.title)
          .setDescription(embed.description)
          .addField(
            'Status',
            `${emojis.success} ${embed.title === 'Bug report' ? 'Fixed' : 'Added'}`
          )
          .setColor(`#${colors.success}`),
      ],
    });

    const user = await this.client.users.fetch(
      embed.description.split(' ')[0].replace(/<@!?([0-9]*)>/gm, '$1')
    );
    const report = embed.description.split('\n```\n')[1].split('```')[0].trim();
    await user.send({
      embeds: [
        new MessageEmbed()
          .setTitle('Bug report')
          .setDescription(
            `This message was delivered by a verified CRBT developer.\nLearn more about CRBT messages **[here](${links.info.messages})**`
          )
          .addField(
            'Subject',
            `Your ${embed.title === 'Bug report' ? 'reported bug' : 'suggestion'} "${
              report.length > 10 ? `${report.slice(0, 10)}...` : report
            }" was ${embed.title === 'Bug report' ? 'fixed' : 'added'}!`
          )
          .setFooter("Note: You can't reply back to a CRBT message.")
          .setColor(`#${colors.success}`),
      ],
      components: [
        new MessageActionRow().addComponents(
          button(
            'LINK',
            `Jump to ${embed.title === 'Bug report' ? 'report' : 'suggestion'}`,
            msg.url
          )
        ),
      ],
    });
    await this.delete();
  },
});
