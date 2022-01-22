import { colors, emojis, illustrations, links, misc } from '$lib/db';
import { button } from '$lib/functions/button';
import { MessageActionRow, MessageEmbed } from 'discord.js';
import { TextCommand } from 'purplet';

export default TextCommand({
  name: 'fix',
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
            .addField(
              'Status',
              `${emojis.success} ${embed.title === 'Bug report' ? 'Fixed' : 'Added'}`
            )
            .setImage(embed.image ? embed.image.url : null)
            .setColor(`#${colors.success}`),
        ],
      });

      await msg.reactions.removeAll();

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
                `Your ${embed.title === 'Bug report' ? 'reported bug' : 'suggestion'} "${
                  report.length > 30 ? `${report.substring(0, 30).trim()}...` : report
                }" was ${embed.title === 'Bug report' ? 'fixed' : 'added'}!`
              )
              .setFooter({ text: "Note: You can't reply back to a CRBT message." })
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
      }
      await this.delete();
    }
  },
});
