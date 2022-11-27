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
  accentColor = 'ACCENT_COLOR',
  joinMessage = 'JOIN_MESSAGE',
  leaveMessage = 'LEAVE_MESSAGE',
  moderationLogs = 'MODERATION_LOGS',
  economy = 'ECONOMY',
}

export enum CamelCaseFeatures {
  ACCENT_COLOR = 'accentColor',
  JOIN_MESSAGE = 'joinMessage',
  LEAVE_MESSAGE = 'leaveMessage',
  MODERATION_LOGS = 'moderationLogs',
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
    modules?: serverModules;
    economy?: Partial<
      Economy & {
        commands: EconomyCommands;
        items: EconomyItem[];
        categories: EconomyItemCategory[];
      }
    >;
  }
>;

export interface SettingsMenus {
  getErrors?(props: Omit<FeatureSettingsProps, 'errors'>): string[];
  getSelectMenu(props: FeatureSettingsProps): Partial<MessageSelectOptionData>;
  getMenuDescription(props: FeatureSettingsProps): Partial<APIEmbed>;
  getComponents(
    props: FeatureSettingsProps & { backBtn: MessageButton; toggleBtn: MessageButton }
  ): any[];
}
