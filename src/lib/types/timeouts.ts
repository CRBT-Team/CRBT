import { Giveaway, ModerationEntry, Poll, Reminder } from '@prisma/client';

export enum TimeoutTypes {
  Giveaway = 'giveaway',
  Poll = 'poll',
  Reminder = 'reminder',
  TemporaryBan = 'moderationEntry',
}

export type Timeout = {
  [TimeoutTypes.Poll]: Poll;
  [TimeoutTypes.Reminder]: Reminder;
  [TimeoutTypes.Giveaway]: Giveaway;
  [TimeoutTypes.TemporaryBan]: Partial<ModerationEntry>;
};

export type AnyTimeout = Timeout[keyof Timeout];
