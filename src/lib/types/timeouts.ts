import { Giveaway, Poll, Reminder } from '@prisma/client';

export enum TimeoutTypes {
  Giveaway = 'giveaway',
  Poll = 'poll',
  Reminder = 'reminder',
}

export type Timeout = {
  [TimeoutTypes.Poll]: Poll;
  [TimeoutTypes.Reminder]: Reminder;
  [TimeoutTypes.Giveaway]: Giveaway;
};

export type AnyTimeout = Timeout[keyof Timeout];
