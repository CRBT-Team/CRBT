import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { CamelCaseFeatures, FullSettings } from '$lib/types/settings';
import { ButtonComponent } from 'purplet';
import { getSettings, renderFeatureSettings } from '../../settings/serverSettings/settings';

export const SaveButton = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = cache.get<JoinLeaveData>(`${type}_BUILDER:${this.guildId}`);
    const settings = await getSettings(this.guild.id);

    settings[CamelCaseFeatures[type]] = data as any;

    (await prisma.servers.upsert({
      where: { id: this.guildId },
      update: {
        [CamelCaseFeatures[type]]: data,
      },
      create: {
        id: this.guildId,
        [CamelCaseFeatures[type]]: data,
      },
      include: { modules: true },
    })) as FullSettings;

    cache.set<FullSettings>(`${this.guildId}:settings`, settings);

    await this.update(await renderFeatureSettings.call(this, type));
    // {
    //   content: invisibleChar,
    //   embeds: [
    //     {
    //       title: `${emojis.success} ${t(this.locale, 'JOINLEAVE_MESSAGE_SAVE_TITLE').replace(
    //         '{TYPE}',
    //         t(this.locale, data.type)
    //       )}`,
    //       description: t(this.locale, `${data.type}_SAVE_DESCRIPTION`).replace(
    //         '{COMMAND}',
    //         slashCmd((type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell') + ' channel')
    //       ),
    //       color: colors.success,
    //     },
    //   ],
    //   components: [],
    // });

    cache.del(`${type}_BUILDER:${this.guildId}`);
  },
});
