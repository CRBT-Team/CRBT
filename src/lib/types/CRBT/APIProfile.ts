export type APIProfile = {
  id: string;
  verified?: boolean;
  bio?: string;
  purplets?: number;
  crbt_badges?: string[];
  crbt_banner?: string;
  crbt_accent_color?: `#${string}` | 'profile';
};
