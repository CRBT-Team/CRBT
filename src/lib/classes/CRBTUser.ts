import { db } from '$lib/db';
import { CRBTscriptParser } from '$lib/functions/CRBTscriptParser';
import type { APIProfile } from '$lib/types/CRBT/APIProfile';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Guild, User } from 'discord.js';
import { Badge, Banner } from './Item';

export class CRBTUser {
  public id: string;
  public name?: string;
  public verified: boolean;
  public bio?: string;
  public purplets: number;
  public badges?: Badge[];
  public banner?: Banner;
  public accent_color?: `#${string}`;
  public url?: string;
  public location?: string;
  public pronouns?: string;
  public likes?: CRBTUser[];
  public birthday?: Dayjs;

  constructor(public user: User, profile: APIProfile) {
    this.id = profile.id;
    this.name = profile.name;
    this.purplets = profile.purplets;
    this.verified = profile.verified;
    this.bio = profile.bio;
    this.badges =
      profile.crbt_badges.length > 0 ? profile.crbt_badges.map((b) => new Badge(b)) : null;
    this.banner = profile.crbt_banner ? new Banner(profile.crbt_banner) : null;
    this.accent_color =
      profile.crbt_accent_color === 'profile' ? user.hexAccentColor : profile.crbt_accent_color;
    this.url = profile.url;
    this.location = profile.location;
    this.pronouns = profile.pronouns;
    this.birthday = dayjs(profile.birthday);
  }

  public async addPurplets(amount: number) {
    const res = await db.profiles.update({
      data: { purplets: { increment: amount } },
      where: { id: this.id },
    });
    this.purplets = res.purplets;
  }

  public async parseBio(guild: Guild) {
    return await CRBTscriptParser(this.bio, this, guild);
  }
}

// export class CRBT {
//   public profiles = new Collection<string, CRBTUser>();
//   constructor(private client: Client) {
//     this.fetchProfiles();
//   }

//   private async fetchProfiles() {
//     const profiles = await db.profiles.findMany();
//     for (const profile of profiles as APIProfile[]) {
//       this.profiles.set(profile.id, new CRBTUser(this.client.users.cache.get(profile.id), profile));
//     }
//   }
// }

// export const crbt = new CRBT(getDiscordClient());
