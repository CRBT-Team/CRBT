import {
  CRBTMessageSourceType,
  createCRBTmsg,
  OfficialMessageType,
} from '$lib/functions/sendCRBTmsg';
import { TextCommand } from 'purplet';

export default TextCommand({
  name: 'broadcast',
  async handle(message) {
    const testers = await this.guild.members
      .fetch()
      .then((m) => m.filter((m2) => m2.roles.cache.has('1068619662763499641')));

    let sentNumber = 0;

    Promise.allSettled(
      testers.map(
        async (tester) =>
          await tester.user
            .send({
              embeds: [
                createCRBTmsg({
                  source: CRBTMessageSourceType.CRBTTeam,
                  action: OfficialMessageType.LabsAnnouncement,
                  locale: 'en-US',
                  message: message.join(' '),
                }),
              ],
            })
            .then(() => (sentNumber += 1))
            .catch(() => {})
      )
    ).then(() => {
      this.reply(`Sent ${sentNumber} DMs!`);
    });
  },
});
