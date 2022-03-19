import { misc } from '$lib/db';
import { TextCommand } from 'purplet';
import { issueReply } from './fix';

export default TextCommand({
  name: 'refuse',
  async handle([id, ...message]) {
    if (this.author.id !== '327690719085068289') return;

    if (
      this.channel.id !==
      (this.client.user.id === misc.CRBTid ? misc.channels.report : misc.channels.reportDev)
    )
      return;

    const msg = await this.channel.messages.fetch(id);

    await issueReply('refuse', msg, this.author, message.join(' '));
    await this.delete();
  },
});
