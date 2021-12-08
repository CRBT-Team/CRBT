import { colors, emojis } from '$lib/db';
import { button } from '$lib/functions/button';
import { DiscordTogether } from 'discord-together';
import { GuildMember, MessageActionRow, MessageEmbed } from 'discord.js';
import { ChatCommand, Choice, OptionBuilder } from 'purplet';

const activities: Choice[] = [
  {
    name: 'Watch Together',
    value: 'youtube',
  },
  {
    name: 'Poker Night',
    value: 'poker',
  },
  {
    name: 'Betrayal.io',
    value: 'betrayal',
  },
  {
    name: 'Fishington.io',
    value: 'fishing',
  },
  {
    name: 'Chess in the Park',
    value: 'chess',
  },
  {
    name: 'Letter Tile',
    value: 'lettertile',
  },
  {
    name: 'Word Snacks',
    value: 'wordsnack',
  },
];

export default ChatCommand({
  name: 'activity',
  description: 'Starts a new Discord activity in a voice channel.',
  options: new OptionBuilder()
    .enum('activity', 'The activity you want to start.', activities, true)
    .channel('channel', 'The channel you want to start the activity in.'),
  async handle({ activity, channel }) {
    const vc = channel ?? (this.member as GuildMember).voice.channel;
    const { code } = await new DiscordTogether(this.client).createTogetherCode(vc.id, activity);
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emojis.success} All set!`)
          .setDescription(
            `Click the button below to join your ${
              activities.find((item) => item.value === activity).name
            } activity in ${vc}.`
          )
          .setColor(`#${colors.success}`),
      ],
      components: [new MessageActionRow().addComponents(button('LINK', `Join Activity`, code))],
    });
  },
});
