import { colors, emojis, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, row } from 'purplet';

const boostRequired = '💎 Level 1 Boosting Required';

const activities = [
  ['Watch Together', '880218394199220334'],
  ['Sketch Heads', '902271654783242291'],
  ['Word Snacks', '879863976006127627'],

  [`Poker Night - ${boostRequired}`, '755827207812677713'],
  [`Chess In The Park - ${boostRequired}`, '832012774040141894'],
  [`Letter League - ${boostRequired}`, '879863686565621790'],
  [`SpellCast - ${boostRequired}`, '852509694341283871'],
  [`Checkers In The Park - ${boostRequired}`, '832013003968348200'],
  [`Blazing 8s - ${boostRequired}`, '832025144389533716'],
  [`Land-io - ${boostRequired}`, '903769130790969345'],
  [`Putt Party - ${boostRequired}`, '945737671223947305'],
  [`NEW - Bobble League - ${boostRequired}`, '947957217959759964'],
  [`NEW - Know What I Meme - ${boostRequired}`, '950505761862189096'],
  [`NEW - Ask Away - ${boostRequired}`, '976052223358406656'],
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
  allowInDMs: false,
  options: new OptionBuilder().string('activity', 'The activity to start', {
    choices,
    required: true,
  }),
  async handle({ activity }) {
    const selected = activities.find(([_, id]) => id === activity);

    if (selected[0].includes(boostRequired) && this.guild.premiumTier === 'NONE') {
      return CRBTError(this, 'This server requires at least level 1 Server Boosting to use this activity!')
    }

    const vc = (await this.guild.members.fetch(this.user)).voice?.channel;

    if (!vc) {
      return CRBTError(this, 'You need to be in a voice channel!');
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
