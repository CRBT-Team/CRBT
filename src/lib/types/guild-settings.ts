// import {
//   Economy,
//   // EconomyCommands,
//   EconomyItem,
//   EconomyItemCategory,
//   serverModules,
//   servers,
// } from '@prisma/client';
import { Giveaway, Guild, GuildModules, ModerationEntry, Poll } from '@prisma/client';
import { Guild as DiscordGuild, Interaction, MessageButton, MessageEditOptions } from 'discord.js';
import { JoinLeaveData } from './messageBuilder';

export enum EditableGuildFeatures {
  automaticTheming = 'SERVER_THEME',
  joinMessage = 'JOIN_MESSAGE',
  leaveMessage = 'LEAVE_MESSAGE',
  joinLeave = 'JOIN_LEAVE',
  moderation = 'MODERATION',
  moderationNotifications = 'MODERATION_LOGS',
  moderationReports = 'MODERATION_REPORTS',
  privacy = 'PRIVACY',
  // economy = 'ECONOMY',
}

export enum CamelCaseGuildFeatures {
  SERVER_THEME = 'automaticTheming',
  JOIN_MESSAGE = 'joinMessage',
  LEAVE_MESSAGE = 'leaveMessage',
  MODERATION_LOGS = 'moderationNotifications',
  MODERATION_REPORTS = 'moderationReports',
  JOIN_LEAVE = 'joinLeave',
  MODERATION = 'moderation',
  PRIVACY = 'privacy',
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
    polls: Poll[];
    giveaways: Giveaway[];
    moderationHistory: ModerationEntry[];
    joinMessage: JoinLeaveData;
    leaveMessage: JoinLeaveData;
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
  mainMenu?: EditableGuildFeatures | undefined;
  description: (locale: string) => string;
  getErrors?(props: Omit<SettingFunctionProps, 'errors'>): string[];
  renderMenuMessage(
    props: SettingFunctionProps & { backBtn: MessageButton },
  ): Promise<Partial<MessageEditOptions>> | Partial<MessageEditOptions>;
}
