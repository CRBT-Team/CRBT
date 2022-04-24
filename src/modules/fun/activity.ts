import { colors, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getStrings } from '$lib/language';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, row } from 'purplet';

const activities = [
  ['Watch Together', '880218394199220334'],
  ['Sketch Heads', '902271654783242291'],
  ['Word Snacks', '879863976006127627'],
  ['Poker Night', '755827207812677713'],
  ['Chess In The Park', '832012774040141894'],
  ['Checkers In The Park', '832013003968348200'],
  ['Blazing 8s', '832025144389533716'],
  ['Letter League', '879863686565621790'],
  ['SpellCast', '852509694341283871'],
];

const choices = activities.map(([name, id]) => ({ name, value: id }));

export default ChatCommand({
  name: 'activity',
  description: 'Start an activity in the current voice channel',
  options: new OptionBuilder().enum('activity', 'The activity to start', choices, true),
  async handle({ activity }) {
    const { GUILD_ONLY } = getStrings(this.locale).globalErrors;

    if (this.channel.type === 'DM') {
      return this.reply(CRBTError(GUILD_ONLY));
    }
    const vc = (await this.guild.members.fetch(this.user)).voice?.channel;

    if (!vc) {
      return this.reply(CRBTError('You need to be in a voice channel!'));
    }
    const { invite } = (await getRestClient().post(`/channels/${vc.id}/invites`, {
      body: {
        max_age: 86400,
        max_uses: 0,
        target_application_id: activity,
        target_type: 2,
        temporary: false,
        validate: null,
      },
      headers: {
        Authorization: `Bot ${this.client.token}`,
        'Content-Type': 'application/json',
      },
    })) as any;

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'All set!',
            iconURL: icons.success,
          })
          .setDescription(
            `Click the button below to join ${choices.find(
              (item) => item.value === activity
            )} in ${vc}.\nNote: Activities do not work on mobile and are still being experimented with. Expect bugs and missing features.`
          )
          .setColor(`#${colors.success}`),
      ],
      components: components(
        row(new MessageButton().setStyle('LINK').setLabel('Join Activity').setURL(invite.code))
      ),
    });
  },
});
