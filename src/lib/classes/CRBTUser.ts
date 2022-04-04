import { db } from '$lib/db';
import type { APIProfile } from '$lib/types/CRBT/APIProfile';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Client, Collection, User } from 'discord.js';
import { getDiscordClient } from 'purplet';
import { Badge, Banner } from './Item';

export class CRBTUser {
  public id: string;
  public name?: string;
  public verified: boolean;
  public bio?: string;
  public purplets: { get: number; add: (amount: number) => void };
  public badges?: Badge[];
  public banner?: Banner;
  public accent_color?: `#${string}` | 'profile';
  public url?: string;
  public location?: string;
  public pronouns?: string;
  public likes?: CRBTUser[];
  public birthday?: Dayjs;

  constructor(public discord: User, profile: APIProfile) {
    this.name = profile.name;
    this.purplets = {
      get: profile.purplets,
      add: async (amount: number) => await this.addPurplets(amount),
    };
    this.verified = profile.verified;
    this.bio = profile.bio;
    this.badges =
      profile.crbt_badges.length > 0 ? profile.crbt_badges.map((b) => new Badge(b)) : null;
    this.banner = profile.crbt_banner ? new Banner(profile.crbt_banner) : null;
    this.accent_color = profile.crbt_accent_color;
    this.url = profile.url;
    this.location = profile.location;
    this.pronouns = profile.pronouns;
    this.birthday = dayjs(profile.birthday);
  }

  private async addPurplets(amount: number) {
    await db.profiles.update({
      data: { purplets: { increment: amount } },
      where: { id: this.id },
    });
  }
}

export class CRBT {
  public profiles = new Collection<string, CRBTUser>();
  constructor(private client: Client) {
    this.fetchProfiles();
  }

  private async fetchProfiles() {
    const profiles = await db.profiles.findMany();
    for (const profile of profiles as APIProfile[]) {
      this.profiles.set(profile.id, new CRBTUser(this.client.users.cache.get(profile.id), profile));
    }
  }
}

export const crbt = new CRBT(getDiscordClient());