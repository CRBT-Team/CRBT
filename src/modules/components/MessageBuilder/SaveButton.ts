import { cache } from '$lib/cache';
import { CamelCaseGuildFeatures } from '$lib/types/guild-settings';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { ButtonComponent } from 'purplet';
import { renderFeatureSettings } from '../../settings/server-settings/settings';
import { getGuildSettings, saveServerSettings } from '../../settings/server-settings/_helpers';

export const SaveButton = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = cache.get<JoinLeaveData>(`${type}_BUILDER:${this.guildId}`);
    const settings = await getGuildSettings(this.guild.id);

    settings[CamelCaseGuildFeatures[type]] = data as any;

    await saveServerSettings(this.guildId, {
      [CamelCaseGuildFeatures[type]]: data,
    });

    cache.del(`${type}_BUILDER:${this.guildId}`);

    await this.update(await renderFeatureSettings.call(this, type));
  },
});
