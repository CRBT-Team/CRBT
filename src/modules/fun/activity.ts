import { colors, emojis } from '$lib/db';
import { button } from '$lib/functions/button';
import { CRBTError } from '$lib/functions/CRBTError';
import { MessageActionRow, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

const activities = [
  { name: 'Watch Together', id: '880218394199220334' },
  { name: 'Poker Night', id: '755827207812677713' },
  { name: 'Betrayal.io', id: '773336526917861400' },
  { name: 'Fishington.io', id: '814288819477020702' },
  { name: 'Chess in the Park', id: '832012774040141894' },
  { name: 'Letter Tile', id: '879863686565621790' },
  { name: 'Word Snacks', id: '879863976006127627' },
  { name: 'Doodle Crew', id: '878067389634314250' },
  { name: 'Awkword', id: '879863881349087252' },
  { name: 'Spell Cast', id: '852509694341283871' },
  { name: 'Checkers in the Park', id: '832013003968348200' },
  { name: 'Putt Party', id: '763133495793942528' },
];

const choices = activities.map(({ name }) => {
  return { name, value: name.toLowerCase().replaceAll(' ', '-').replaceAll('.', '') };
});

export default ChatCommand({
  name: 'activity',
  description: 'Starts a new Discord activity in a voice channel.',
  options: new OptionBuilder()
    .enum('activity', 'The activity you want to start.', choices, true)
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
          target_application_id: activities.find[activity],
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
            button('LINK', `Join ${choices.find((item) => item.value === activity).name}`, code)
          ),
        ],
      });
    }
  },
});
