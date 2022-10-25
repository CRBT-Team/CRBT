import { Giveaway, Poll, Reminder } from '@prisma/client';

export enum TimeoutTypes {
  Giveaway = 'giveaway',
  Poll = 'poll',
  Reminder = 'reminder',
}

export type Timeout<T extends TimeoutTypes> = T extends TimeoutTypes.Giveaway
  ? Giveaway
  : T extends TimeoutTypes.Reminder
  ? Reminder
  : Poll;
