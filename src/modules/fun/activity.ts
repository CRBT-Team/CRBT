import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { GatewayInviteCreateDispatchData, Routes } from 'discord-api-types/v10';
import { MessageButton } from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, row } from 'purplet';

const notice = {
  free: '(Free)',
  boosting: '(🚀 May require Boosting)',
  premium: '(💎 Nitro required)',
  limited: '(May be free)',
};

const activities = [
  [`📺 Watch Together ${notice.free}`, '880218394199220334'],
  [`⛳ Putt Party ${notice.free}`, '945737671223947305'],

  [`#️⃣ Ask Away ${notice.limited}`, '976052223358406656'],
  [`😂 Know What I Meme ${notice.limited}`, '950505761862189096'],
  [`🔠 Word Snacks ${notice.limited}`, '879863976006127627'],

  [`🚘 Bash Out ${notice.premium}`, '1006584476094177371'],
  [`⚽ Bobble League ${notice.premium}`, '947957217959759964'],
  [`🔮 SpellCast ${notice.premium}`, '852509694341283871'],

  [`🃏 Poker Night ${notice.premium}`, '755827207812677713'],
  [`🖌️ Sketch Heads ${notice.premium}`, '902271654783242291'],
  [`♟️ Chess In The Park ${notice.premium}`, '832012774040141894'],
  [`🐍 Land-io ${notice.premium}`, '903769130790969345'],
  [`🎴 Blazing 8s ${notice.premium}`, '832025144389533716'],
  [`📝 Letter League ${notice.premium}`, '879863686565621790'],
  [`🔴 Checkers In The Park ${notice.premium}`, '832013003968348200'],
];

const choices = activities.reduce(
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
    // const selected = activities.find(([_, id]) => id === activity);

    // if (selected[0].includes(notice.premium) && this.guild.premiumTier === 'NONE') {
    //   return CRBTError(
    //     this,
    //     'This server requires at least level 1 Server Boosting to use this activity!'
    //   );
    // }

    const vc = (await this.guild.members.fetch(this.user)).voice?.channelId;

    if (!vc) {
      return CRBTError(this, 'You need to be in a voice channel!');
    }

    const invite = (await getRestClient().post(Routes.channelInvites(vc), {
      body: {
        max_age: 86400,
        max_uses: 0,
        target_application_id: activity,
        target_type: 2,
        temporary: false,
        validate: null,
      },
      // headers: {
      //   Authorization: `Bot ${this.client.token}`,
      //   'Content-Type': 'application/json',
      // },
    })) as GatewayInviteCreateDispatchData;

    await this.reply({
      embeds: [
        {
          title: `${emojis.success} All set!`,
          description: `Click the button below to join **${invite.target_application.name}** in <#${vc}>.\n**[Learn more about Activities](https://discord.com/blog/server-activities-games-voice-watch-together)**.`,
          thumbnail: {
            url: `https://cdn.discordapp.com/app-icons/${invite.target_application.id}/${invite.target_application.icon}.png?size=64`,
          },
          color: colors.success,
        },
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
