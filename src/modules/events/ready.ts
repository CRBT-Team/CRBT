import { OnEvent } from 'purplet';

export default OnEvent('ready', (client) => {
  client.user.setActivity({
    name: '/crbt info | crbt.ga',
  });
});
