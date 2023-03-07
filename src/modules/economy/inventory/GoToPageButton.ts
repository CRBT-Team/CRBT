import { ButtonComponent } from 'purplet';
import { PageBtnProps } from '../../../../disabled/info/achievements';
import { getServerMember } from '../_helpers';
import { renderInventory } from './inventory';

export const GoToPageButton = ButtonComponent({
  async handle({ page }: PageBtnProps) {
    const member = await getServerMember(this.user.id, this.guildId);

    await this.update(await renderInventory.call(this, member, page));
  },
});
