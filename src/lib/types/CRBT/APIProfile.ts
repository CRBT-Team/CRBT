import { items } from '$lib/db';

type Badge = keyof typeof items.badges;
type Banner = keyof typeof items.banners;

export type APIProfile = {
  id: string;
  name?: string;
  verified?: boolean;
  bio?: string;
  purplets: number;
  crbt_badges?: Badge[];
  crbt_banner?: Banner;
  crbt_accent_color?: `#${string}` | 'profile';
  url?: string;
  location?: string;
  pronouns?: string;
  likes?: string[];
  birthday?: Date;
};
