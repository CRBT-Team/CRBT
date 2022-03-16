import { colors, illustrations } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, row } from 'purplet';

const activities = [
  { name: 'Watch Together - Unlimited participants', id: '880218394199220334' },
  { name: 'Sketch Heads - Up to 16 players', id: '902271654783242291' },
  { name: 'Word Snacks - Up to 8 players', id: '879863976006127627' },
  { name: 'Poker Night - 💎 Requires Boosting', id: '755827207812677713' },
  { name: 'Chess In The Park - 💎 Requires Boosting', id: '832012774040141894' },
  { name: 'Checkers In The Park - 💎 Requires Boosting', id: '832013003968348200' },
  { name: 'Blazing 8s - 💎 Requires Boosting', id: '832025144389533716' },
  { name: 'Letter League - 💎 Requires Boosting', id: '879863686565621790' },
  { name: 'SpellCast - 💎 Requires Boosting', id: '852509694341283871' },
  // { name: 'Betrayal.io', id: '773336526917861400' },
  // { name: 'Fishington.io', id: '814288819477020702' },
  // { name: 'Awkword', id: '879863881349087252' },
  // { name: 'Putt Party', id: '763133495793942528' },
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
    if (this.channel.type === 'DM') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }
    const vc = channel ?? (await this.guild.members.fetch(this.user)).voice?.channel;

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
      const code = await getRestClient()
        .post(`/channels/${vc.id}/invites`, {
          body: {
            max_age: 86400,
            max_uses: 0,
            target_application_id: activities.find(
              ({ name }) => name === choices.find(({ value }) => value === activity).name
            ).id,
            target_type: 2,
            temporary: false,
            validate: null,
          },
          headers: {
            Authorization: `Bot ${this.client.token}`,
            'Content-Type': 'application/json',
          },
        })
        .then((invite: any) => {
          return `https://discord.com/invite/${invite.code}`;
        });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'All set!',
              iconURL: illustrations.success,
            })
            .setDescription(
              `Click the button below to join **${
                choices.find((item) => item.value === activity).name.split(' | ')[0]
              }** in ${vc}.\nNote: Activities do not work on mobile and are in early development. Some features may be unavailable`
            )
            .setColor(`#${colors.success}`),
        ],
        components: components(
          row(new MessageButton().setStyle('LINK').setLabel(`Join Activity`).setURL(code))
        ),
      });
    }
  },
});
