import { User } from '@prisma/client';
import { APIEmbed } from 'discord-api-types/v10';
import { Interaction, MessageButton, MessageSelectOptionData } from 'discord.js';

export enum UserSettingsMenus {
  privacy = 'PRIVACY',
}

export enum CamelCaseGuildFeatures {
  PRIVACY = 'privacy',
}

export interface UserSettingsMenusFunctionProps {
  user: FullUser;
  accentColor: number;
  menu: UserSettingsMenus;
  i?: Interaction;
  errors?: string[];
}

export type FullUser = Partial<User>;

export interface UserSettingsMenusProps {
  newLabel?: boolean;
  getOverviewValue(props: UserSettingsMenusFunctionProps): {
    icon?: string;
    value: string;
  };
  getErrors?(props: Omit<UserSettingsMenusFunctionProps, 'errors'>): string[];
  getSelectMenu(props: UserSettingsMenusFunctionProps): Partial<MessageSelectOptionData>;
  getMenuDescription(props: UserSettingsMenusFunctionProps): Partial<APIEmbed>;
  getComponents(props: UserSettingsMenusFunctionProps & { backBtn: MessageButton }): any[];
}
