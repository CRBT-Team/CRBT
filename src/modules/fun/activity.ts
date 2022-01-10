import { colors, emojis } from '$lib/db';
import { button } from '$lib/functions/button';
import { CRBTError } from '$lib/functions/CRBTError';
import { MessageActionRow, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
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

const applications = {
  youtube: '880218394199220334',
  poker: '755827207812677713',
  betrayal: '773336526917861400',
  fishing: '814288819477020702',
  chess: '832012774040141894',
  lettertile: '879863686565621790',
  wordsnack: '879863976006127627',
  doodlecrew: '878067389634314250',
  awkword: '879863881349087252',
  spellcast: '852509694341283871',
  checkers: '832013003968348200',
  puttparty: '763133495793942528',
};

export default ChatCommand({
  name: 'activity',
  description: 'Starts a new Discord activity in a voice channel.',
  options: new OptionBuilder()
    .enum('activity', 'The activity you want to start.', activities, true)
    .channel('channel', 'The channel you want to start the activity in.'),
  async handle({ activity, channel }) {
    const user = await this.guild.members.fetch(this.user);
    console.log(user);
    const vc = channel ?? (await this.guild.members.fetch(this.user)).voice.channel;

    if (!vc)
      await this.reply(
        CRBTError(
          this,
          'You need to be in a voice channel, or to choose a voice channel using the `channel` option.'
        )
      );
    else if (vc.type !== 'GUILD_VOICE')
      await this.reply(
        CRBTError(this, 'You need to choose a voice channel in order to start an activity!')
      );
    else {
      const code = await fetch(`https://discord.com/api/v9/channels/${vc.id}/invites`, {
        method: 'POST',
        body: JSON.stringify({
          max_age: 86400,
          max_uses: 0,
          target_application_id: applications[activity],
          target_type: 2,
          temporary: false,
          validate: null,
        }),
        headers: {
          Authorization: `Bot ${this.client.token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((invite: any) => {
          return `https://discord.com/invite/${invite.code}`;
        });

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
