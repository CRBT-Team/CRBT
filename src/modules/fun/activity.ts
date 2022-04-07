import { colors, illustrations } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { languages } from '$lib/language';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, row } from 'purplet';

const { meta } = languages['en-US'].activity;

const activities = [
  '880218394199220334', // Watch Together
  '902271654783242291', // Sketch Heads
  '879863976006127627', // Word Snacks
  '755827207812677713', // Poker Night
  '832012774040141894', // Chess In The Park
  '832013003968348200', // Checkers In The Park
  '832025144389533716', // Blazing 8s
  '879863686565621790', // Letter League
  '852509694341283871', // SpellCast
];

const choices = activities.map((id, index) => {
  const name = meta.options[0].choices[index];
  return { name, value: id };
});

export default ChatCommand({
  ...meta,
  options: new OptionBuilder()
    .enum('activity', meta.options[0].description, choices, true)
    .channel('channel', meta.options[1].description),
  async handle({ activity, channel }) {
    const { strings, errors } = languages[this.locale].activity;
    const { GUILD_ONLY } = languages[this.locale].globalErrors;

    if (this.channel.type === 'DM') {
      return this.reply(CRBTError(GUILD_ONLY));
    }
    const vc = channel ?? (await this.guild.members.fetch(this.user)).voice?.channel;

    if (!vc) await this.reply(CRBTError(errors.NO_CHANNEL));
    else if (vc.type !== 'GUILD_VOICE') await this.reply(CRBTError(errors.NOT_VOICE));
    else {
      const code = await getRestClient()
        .post(`/channels/${vc.id}/invites`, {
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
        })
        .then((invite: any) => {
          return `https://discord.com/invite/${invite.code}`;
        });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.EMBED_TITLE,
              iconURL: illustrations.success,
            })
            .setDescription(
              strings.EMBED_DESCRIPTION.replace(
                '<ACTIVITY>',
                `**${choices.find((item) => item.value === activity).name.split(' | ')[0]}**}`
              ).replace('<CHANNEL>', `${vc}`)
            )
            .setColor(`#${colors.success}`),
        ],
        components: components(
          row(new MessageButton().setStyle('LINK').setLabel(strings.BUTTON_LABEL).setURL(code))
        ),
      });
    }
  },
});
