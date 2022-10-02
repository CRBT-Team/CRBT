import { MessageContextCommand } from 'purplet';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { verifySubscription } from '$lib/subscription/verifySubscription';

// export default 
MessageContextCommand({
  name: 'Remind me about this',
  async handle(message) {
    if (!(await verifySubscription(this.user.id))) {
      this.reply('buy crbt+ https://ko-fi.com/clembs')
      return;
    }

    const url = message.url.replace(/https:\/\/((canary|ptb)\.)?discord\.com\/channels\//, '')

    const h = (await dbTimeout({
      type: TimeoutTypes.Reminder,
      data: {
        url,
        destination: 'dm',
        subject: 'MessageReminder',
        userId: this.user.id,
      },
      expiration: new Date(Date.now() + 300000),
      id: null,
      locale: this.locale
    }));

    this.reply('ok')


  },
});