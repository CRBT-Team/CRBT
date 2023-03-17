import { cache } from '$lib/cache';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { CamelCaseFeatures } from '$lib/types/settings';
import { ButtonComponent } from 'purplet';
import { renderFeatureSettings } from '../../settings/serverSettings/settings';
import { getSettings, saveServerSettings } from '../../settings/serverSettings/_helpers';

export const SaveButton = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = cache.get<JoinLeaveData>(`${type}_BUILDER:${this.guildId}`);
    const settings = await getSettings(this.guild.id);

    settings[CamelCaseFeatures[type]] = data as any;

    await saveServerSettings(this.guildId, {
      [CamelCaseFeatures[type]]: data,
    });

    cache.del(`${type}_BUILDER:${this.guildId}`);

    await this.update(await renderFeatureSettings.call(this, type));
  },
});
