// import {
//   Economy,
//   // EconomyCommands,
//   EconomyItem,
//   EconomyItemCategory,
//   serverModules,
//   servers,
// } from '@prisma/client';
import { Guild, GuildModules } from '@prisma/client';
import { Guild as DiscordGuild, Interaction, MessageButton, MessageEditOptions } from 'discord.js';

export enum EditableGuildFeatures {
  automaticTheming = 'SERVER_THEME',
  joinMessage = 'JOIN_MESSAGE',
  leaveMessage = 'LEAVE_MESSAGE',
  joinLeave = 'JOIN_LEAVE',
  moderation = 'MODERATION',
  moderationLogs = 'MODERATION_LOGS',
  moderationReports = 'MODERATION_REPORTS',
  // economy = 'ECONOMY',
}

export enum CamelCaseGuildFeatures {
  SERVER_THEME = 'automaticTheming',
  JOIN_MESSAGE = 'joinMessage',
  LEAVE_MESSAGE = 'leaveMessage',
  MODERATION_LOGS = 'moderationLogs',
  MODERATION_REPORTS = 'moderationReports',
  JOIN_LEAVE = 'joinLeave',
  MODERATION = 'moderation',
  // ECONOMY = 'economy',
}

export interface SettingFunctionProps {
  guild: DiscordGuild;
  settings: FullGuildSettings;
  i?: Interaction;
  errors?: string[];
}

export type FullGuildSettings = Partial<
  Guild & {
    modules?: Partial<GuildModules>;
    // economy?: Partial<
    //   Economy & {
    //     commands: Partial<EconomyCommands>;
    //     items: EconomyItem[];
    //     categories: (EconomyItemCategory & {
    //       items: EconomyItem[];
    //     })[];
    //   }
    // >;
  }
>;

export interface SettingsMenuProps {
  newLabel?: boolean;
  isSubMenu?: boolean;
  description: (locale: string) => string;
  getErrors?(props: Omit<SettingFunctionProps, 'errors'>): string[];
  renderMenuMessage(
    props: SettingFunctionProps & { backBtn: MessageButton },
  ): Partial<MessageEditOptions>;
}
