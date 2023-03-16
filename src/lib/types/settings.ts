import {
  Economy,
  EconomyCommands,
  EconomyItem,
  EconomyItemCategory,
  serverModules,
  servers,
} from '@prisma/client';
import { APIEmbed } from 'discord-api-types/v10';
import { Guild, Interaction, MessageButton, MessageSelectOptionData } from 'discord.js';

export enum EditableFeatures {
  automaticTheming = 'SERVER_THEME',
  joinMessage = 'JOIN_MESSAGE',
  leaveMessage = 'LEAVE_MESSAGE',
  moderationLogs = 'MODERATION_LOGS',
  moderationReports = 'MODERATION_REPORTS',
  economy = 'ECONOMY',
}

export enum CamelCaseFeatures {
  SERVER_THEME = 'automaticTheming',
  JOIN_MESSAGE = 'joinMessage',
  LEAVE_MESSAGE = 'leaveMessage',
  MODERATION_LOGS = 'moderationLogs',
  MODERATION_REPORTS = 'moderationReports',
  ECONOMY = 'economy',
}

export interface FeatureSettingsProps {
  guild: Guild;
  settings: FullSettings;
  feature: EditableFeatures;
  i?: Interaction;
  errors?: string[];
  isEnabled: boolean;
}

export type FullSettings = Partial<
  servers & {
    modules?: Partial<serverModules>;
    economy?: Partial<
      Economy & {
        commands: Partial<EconomyCommands>;
        items: EconomyItem[];
        categories: (EconomyItemCategory & {
          items: EconomyItem[];
        })[];
      }
    >;
  }
>;

export interface SettingsMenus {
  newLabel?: boolean;
  getOverviewValue(props: FeatureSettingsProps): {
    icon?: string;
    value: string;
  };
  getErrors?(props: Omit<FeatureSettingsProps, 'errors'>): string[];
  getSelectMenu(props: FeatureSettingsProps): Partial<MessageSelectOptionData>;
  getMenuDescription(props: FeatureSettingsProps): Partial<APIEmbed>;
  getComponents(
    props: FeatureSettingsProps & { backBtn: MessageButton; toggleBtn: MessageButton }
  ): any[];
}
