/* eslint-disable no-case-declarations */
//import { formatMessage } from '$lib';
import { ChatCommand, OptionBuilder } from 'purplet';
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import moment from 'moment';

export default ChatCommand({
  name: 'ping',
  description: 'Pings CRBT and returns connection information.',
  options: new OptionBuilder().enum('type', 'The type of info you want to get from CRBT', [
    {name: 'Global info', value: 'global'},
    {name: 'Statistics', value: 'stats'},
    {name: 'Credits', value: 'credits'},
  ], false),
  async handle(opts) {
    this.deferReply();
      const date = new Date('6/29/2021, 9:48:17 AM');
      const e = new MessageEmbed()
        .setAuthor('CRBT Dev - Information', 'https://cdn.discordapp.com/avatars/859369676140314624/435b239b4059efa6a5f491cd8c2fbcdd.png?size=2048', 'https://crbt.ga')
        .addFields([
          {name: 'Users', value: '594854958349859344083404', inline: true},
          {name: 'Servers', value: '43908542394038', inline: true},
          {name: 'Channels', value: '5495454059409504', inline: true},
          {name: 'Created', value: `<t:${moment(date).format('X')}>`},
          {name: 'Average ping', value: '≈0 milliseconds (`/ping`)'},
          {name: 'Online since', value: 'Forever'}
        ])
        .setThumbnail('https://cdn.discordapp.com/avatars/859369676140314624/435b239b4059efa6a5f491cd8c2fbcdd.png?size=2048')
        .setColor('NAVY');

        this.editReply({ 
          embeds: [e], 
          components: [
            new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setLabel('Website')
                  .setStyle('LINK')
                  .setURL('https://crbt.ga'),
                new MessageButton()
                .setLabel('Invite')
                .setStyle('LINK')
                .setURL('https://crbt.ga/invite'),
                new MessageButton()
                .setLabel('Discord')
                .setStyle('LINK')
                .setURL('https://crbt.ga/discord'),
                new MessageButton()
                .setLabel('GitHub')
                .setStyle('LINK')
                .setURL('https://github.com/CRBT-Team'),
              )
          ]
        });
    }
});
