import { colors, emojis } from '$lib/db';
import { button } from '$lib/functions/button';
import { CRBTError } from '$lib/functions/CRBTError';
import { DiscordTogether } from 'discord-together';
import { MessageActionRow, MessageEmbed } from 'discord.js';
import { ChatCommand, Choice, OptionBuilder } from 'purplet';

const activities: Choice[] = [
  { name: 'Watch Together', value: 'youtube' },
  { name: 'Poker Night', value: 'poker' },
  { name: 'Betrayal.io', value: 'betrayal' },
  { name: 'Fishington.io', value: 'fishing' },
  { name: 'Chess in the Park', value: 'chess' },
  { name: 'Letter Tile', value: 'lettertile' },
  { name: 'Word Snacks', value: 'wordsnack' },
  { name: 'Doodle Crew', value: 'doodlecrew' },
  { name: 'Awkword', value: 'awkword' },
  { name: 'Spell Cast', value: 'spellcast' },
  { name: 'Checkers in the Park', value: 'checkers' },
  { name: 'Putt Party', value: 'puttparty' },
];

export default ChatCommand({
  name: 'activity',
  description: 'Starts a new Discord activity in a voice channel.',
  options: new OptionBuilder()
    .enum('activity', 'The activity you want to start.', activities, true)
    .channel('channel', 'The channel you want to start the activity in.'),
  async handle({ activity, channel }) {
    const vc = channel ?? (await this.guild.members.fetch(this.user)).voice.channel ?? null;

    if (!vc)
      await this.reply(
        CRBTError(
          'You need to be in a voice channel, or to choose a voice channel using the `channel` option.'
        )
      );
    else if (vc.type !== 'GUILD_VOICE')
      await this.reply(
        CRBTError('You need to choose a voice channel in order to start an activity!')
      );
    else {
      const { code } = await new DiscordTogether(this.client).createTogetherCode(vc.id, activity);
      await this.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.success} All set!`)
            .setDescription(`Click the button below to join your activity in ${vc}.`)
            .setColor(`#${colors.success}`),
        ],
        components: [
          new MessageActionRow().addComponents(
            button('LINK', `Join ${activities.find((item) => item.value === activity).name}`, code)
          ),
        ],
      });
    }
  },
});
