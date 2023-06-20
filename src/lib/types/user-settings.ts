import { User } from '@prisma/client';
import { Interaction, MessageButton, MessageEditOptions } from 'discord.js';

export enum EditableUserSettings {
  privacy = 'PRIVACY',
  accentColor = 'ACCENT_COLOR',
}

export enum CamelCaseUserFeatures {
  PRIVACY = 'privacy',
  ACCENT_COLOR = 'accentColor',
}

export interface UserSettingFunctionProps {
  user: FullUser;
  accentColor: number;
  i?: Interaction;
  errors?: string[];
}

export type FullUser = Partial<User>;

export interface UserSettingsMenusProps {
  newLabel?: boolean;
  isSubMenu?: boolean;
  description: (locale: string) => string;
  getErrors?(props: Omit<UserSettingFunctionProps, 'errors'>): string[];
  renderMenuMessage(
    props: UserSettingFunctionProps & { backBtn: MessageButton }
  ): Partial<MessageEditOptions>;
}
