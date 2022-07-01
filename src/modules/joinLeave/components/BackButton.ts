import { ButtonComponent } from 'purplet';
import { joinBuilderCache, renderJoinLeaveBuilder } from '../renderers';
import { MessageTypes } from '../types';

export const BackButton = ButtonComponent({
  async handle(type: MessageTypes) {
    this.update(await renderJoinLeaveBuilder.call(this, type, joinBuilderCache.get(this.guildId)));
  },
});
