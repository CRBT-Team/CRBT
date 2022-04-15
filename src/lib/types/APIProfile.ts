import { items } from '$lib/db';

export type BadgeNames = keyof typeof items.badges;
export type BannerNames = keyof typeof items.banners;

export type APIProfile = {
  id: string;
  name?: string;
  verified?: boolean;
  bio?: string;
  purplets: number;
  crbt_badges?: BadgeNames[];
  crbt_banner?: BannerNames;
  crbt_accent_color?: `#${string}` | 'profile';
  url?: string;
  location?: string;
  pronouns?: string;
  likes?: string[];
  birthday?: Date;
};
