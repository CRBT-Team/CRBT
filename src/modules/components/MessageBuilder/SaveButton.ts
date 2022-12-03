import { cache, fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { CamelCaseFeatures } from '$lib/types/settings';
import { ButtonComponent } from 'purplet';
import { renderFeatureSettings } from '../../settings/serverSettings/settings';
import { getSettings, include } from '../../settings/serverSettings/_helpers';

export const SaveButton = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = cache.get<JoinLeaveData>(`${type}_BUILDER:${this.guildId}`);
    const settings = await getSettings(this.guild.id);

    settings[CamelCaseFeatures[type]] = data as any;

    await fetchWithCache(
      `${this.guildId}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: this.guildId },
          update: {
            [CamelCaseFeatures[type]]: data,
          },
          create: {
            id: this.guildId,
            [CamelCaseFeatures[type]]: data,
          },
          include,
        }),
      true
    );

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
