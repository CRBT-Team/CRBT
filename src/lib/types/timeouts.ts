import { Giveaway, ModerationEntry, Reminder } from '@prisma/client';

export enum TimeoutTypes {
  Giveaway = 'giveaway',
  Reminder = 'reminder',
  TemporaryBan = 'moderationEntry',
}

export type Timeout = {
  [TimeoutTypes.Reminder]: Reminder;
  [TimeoutTypes.Giveaway]: Giveaway;
  [TimeoutTypes.TemporaryBan]: Partial<ModerationEntry>;
};

export type AnyTimeout = Timeout[keyof Timeout];
