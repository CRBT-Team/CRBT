import { colors, illustrations, links, misc } from '$lib/db';
import { MessageButton, MessageEmbed } from 'discord.js';
import { components, row, TextCommand } from 'purplet';

export default TextCommand({
  name: 'reply',
  async handle([id, ...message]) {
    if (this.author.id !== '327690719085068289')
      this.reply('You do not have permission to use this command.');

    if (
      this.channel.id ===
      (this.client.user.id === misc.CRBTid ? misc.channels.report : misc.channels.reportDev)
    ) {
      const msg = await this.channel.messages.fetch(id);
      const embed = msg.embeds[0];

      await msg.edit({
        embeds: [
          new MessageEmbed()
            .setTitle(embed.title)
            .setDescription(embed.description)
            .addFields(embed.fields ?? [{ name: 'Status', value: 'Pending' }])
            .addField(`Message from ${this.author.tag}`, message.join(' '))
            .setImage(embed.image ? embed.image.url : null)
            .setColor(`#${colors.yellow}`),
        ],
      });

      const user = !embed.description.includes('Anonymously reported')
        ? await this.client.users.fetch(
            embed.description.split('>')[0].replace(/<@!?([0-9]*)/gm, '$1')
          )
        : null;

      if (user) {
        const report = embed.description.split('```\n')[1].split('```')[0].trim();
        await user.send({
          embeds: [
            new MessageEmbed()
              .setAuthor({ name: "You've got mail!", iconURL: illustrations.information })
              .setDescription(
                `This message was delivered by a verified CRBT developer.\nLearn more about CRBT messages **[here](${links.info.messages})**`
              )
              .addField(
                'Subject',
                `${embed.title} "${
                  report.length > 30 ? `${report.substring(0, 30).trim()}...` : report
                }"`
              )
              .addField(`Message from ${this.author.tag}`, message.join(' '))
              .setFooter({ text: "Note: You can't reply back to a CRBT message." })
              .setColor(`#${colors.success}`),
          ],
          components: components(
            row(
              new MessageButton()
                .setStyle('LINK')
                .setLabel(`Jump to ${embed.title === 'Bug report' ? 'report' : 'suggestion'}`)
                .setURL(msg.url)
            )
          ),
        });
      }
      await this.delete();
    }
  },
});
