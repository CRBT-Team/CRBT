import { colors, emojis, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getStrings } from '$lib/language';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, row } from 'purplet';

const activities = [
  ['Watch Together', '880218394199220334'],
  ['Sketch Heads', '902271654783242291'],
  ['Word Snacks', '879863976006127627'],

  ['Poker Night - 💎 Level 1 Boosting Required', '755827207812677713'],
  ['Chess In The Park - 💎 Level 1 Boosting Required', '832012774040141894'],
  ['Letter League - 💎 Level 1 Boosting Required', '879863686565621790'],
  ['SpellCast - 💎 Level 1 Boosting Required', '852509694341283871'],
  ['Checkers In The Park - 💎 Level 1 Boosting Required', '832013003968348200'],
  ['Blazing 8s - 💎 Level 1 Boosting Required', '832025144389533716'],
  ['Land-io - 💎 Level 1 Boosting Required', '903769130790969345'],
  ['Putt Party - 💎 Level 1 Boosting Required', '945737671223947305'],
  ['Bobble League - 💎 Level 1 Boosting Required', '947957217959759964'],
];

const choices = activities.reduce(
  // id: name
  (acc, [name, id]) => ({
    ...acc,
    [id]: name,
  }),
  {}
);

export default ChatCommand({
  name: 'activity',
  description: 'Start an activity in the current voice channel',
  options: new OptionBuilder().string('activity', 'The activity to start', {
    choices,
    required: true,
  }),
  async handle({ activity }) {
    const { GUILD_ONLY } = getStrings(this.locale, 'globalErrors');

    if (this.channel.type === 'DM') {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    const selected = activities.find(([_, id]) => id === activity);

    if (selected[0].includes('💎 Level 1 Boosting Required') && this.guild.premiumTier === 'NONE') {
      return this.reply(
        CRBTError('This server requires at least level 1 Server Boosting to use this activity!')
      );
    }

    const vc = (await this.guild.members.fetch(this.user)).voice?.channel;

    if (!vc) {
      return this.reply(CRBTError('You need to be in a voice channel!'));
    }
    const invite = (await getRestClient().post(`/channels/${vc.id}/invites`, {
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
            `Click the button below to join ${invite.target_application.name} in ${vc}.\nNote: Activities do not work on mobile and are still being experimented with. Expect bugs and missing features.`
          )
          .setThumbnail(
            `https://cdn.discordapp.com/app-icons/${invite.target_application.id}/${invite.target_application.icon}.png?size=128`
          )
          .setColor(`#${colors.success}`),
      ],
      components: components(
        row(
          new MessageButton()
            .setStyle('LINK')
            .setLabel('Join Activity')
            .setURL(`https://discord.gg/${invite.code}`)
            .setEmoji(emojis.buttons.activity)
        )
      ),
    });
  },
});
