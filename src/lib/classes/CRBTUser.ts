import { db, emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { getColor } from '$lib/functions/getColor';
import { profiles } from '@prisma/client';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { User } from 'discord.js';
import { getDiscordClient } from 'purplet';
import pjson from '../../../package.json';
import { Badge, Banner } from './Item';

export class CRBTUser {
  public id: string;
  public name?: string;
  public verified: boolean;
  public bio?: string;
  public purplets: number;
  public badges?: Badge[];
  public banner?: Banner;
  public accent_color?: `#${string}` | 'profile';
  public url?: string;
  public location?: string;
  public pronouns?: string;
  public likes?: CRBTUser[];
  public birthday?: Dayjs;

  constructor(public user: User, profile?: profiles) {
    this.id = user.id;
    this.name = profile?.name;
    this.purplets = profile?.purplets;
    this.verified = profile?.verified;
    this.bio = profile?.bio;
    this.badges =
      profile?.crbt_badges.length > 0 ? profile?.crbt_badges.map((b) => new Badge(b)) : null;
    this.banner = profile?.crbt_banner ? new Banner(profile.crbt_banner) : null;
    this.accent_color = profile?.crbt_accent_color as `#${string}` | 'profile';
    this.url = profile?.url;
    this.location = profile?.location;
    this.pronouns = profile?.pronouns;
    this.birthday = profile?.birthday ? dayjs(profile.birthday) : null;
  }

  public async addPurplets(amount: number) {
    const res = await db.profiles.update({
      data: { purplets: { increment: amount } },
      where: { id: this.id },
    });
    this.purplets = res.purplets;
  }

  public async parseBio() {
    let { bio } = this;
    const { user } = this;
    const client = getDiscordClient();

    const values: [string, any][] = [
      ['<user.name>', user.username],
      ['<user.discrim>', user.discriminator],
      ['<user.tag>', user.tag],
      ['<user.id>', user.id],
      ['<user.avatar>', () => avatar(user)],
      ['<user.banner>', () => banner(user) ?? 'None'],
      // ['<user.nickname>', member ? member.nickname : user.username],
      ['<user.created>', () => user.createdAt.toISOString()],

      ['<profile.name>', this.name ?? ''],
      ['<profile.bio>', this.bio ?? ''],
      ['<profile.color>', async () => await getColor(user)],
      ['<profile.verified>', this.verified ? emojis.verified : 'false'],
      ['<profile.purplets>', this.purplets],

      ['<newline>', '\n'],
      ['<purplets>', this.purplets ?? '0'],

      ['<crbt.name>', client.user.username],
      ['<crbt.tag>', client.user.tag],
      ['<crbt.id>', client.user.id],
      ['<crbt.version', pjson.version],
      ['<crbt.purplet.version>', pjson.dependencies.purplet.slice(1)],
    ];

    values.forEach(async ([key, value]) => {
      if (typeof value === 'function') {
        bio = bio.replaceAll(key, await value());
      } else {
        bio = bio.replaceAll(key, value);
      }
    });

    return bio;
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
