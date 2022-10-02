import { serverModules, servers } from "@prisma/client";
import { APIEmbed } from "discord-api-types/v10";
import { Guild, Interaction, MessageButton, MessageSelectOptionData } from "discord.js";

export enum EditableFeatures {
  accentColor = 'ACCENT_COLOR',
  joinMessage = 'JOIN_MESSAGE',
  leaveMessage = 'LEAVE_MESSAGE'
}

export enum CamelCaseFeatures {
  ACCENT_COLOR = 'accentColor',
  JOIN_MESSAGE = 'joinMessage',
  LEAVE_MESSAGE = 'leaveMessage'
}

export interface FeatureSettingsProps {
  guild: Guild,
  settings: FullSettings,
  feature: EditableFeatures,
  i?: Interaction,
}

export type FullSettings = servers & { modules: serverModules };

export interface SettingsMenus {
  getSelectMenu(props: FeatureSettingsProps): MessageSelectOptionData;
  getMenuDescription(props: FeatureSettingsProps): Partial<APIEmbed>;
  getComponents(props: FeatureSettingsProps & { backBtn: MessageButton, toggleBtn: MessageButton }): any[];
}