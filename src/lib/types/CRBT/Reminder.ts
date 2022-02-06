import { Dayjs } from 'dayjs';

export type Reminder = {
  id?: number;
  expiration: Dayjs;
  user_id: string;
  destination: string | 'dm';
  reminder: string;
  url: string;
};
