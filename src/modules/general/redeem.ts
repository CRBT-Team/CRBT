import { prisma } from '$lib/db';
import { colors, links } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { AchievementProgress } from '$lib/responses/Achievements';
import { TokenData, TokenTypes } from '$lib/types/tokens';
import { PurchasableTypes } from '@prisma/client';
import dayjs from 'dayjs';
import dedent from 'dedent';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'redeem',
  description: 'Redeem a valid CRBT+ code, or an API token.',
  options: new OptionBuilder().string(
    'code',
    'A CRBT+ transaction ID, Gift Code or an API token.',
    {
      required: true,
    }
  ),
  async handle({ code }) {
    await this.deferReply({
      ephemeral: true,
    });

    const token = (await prisma.token.findUnique({
      where: { token: code },
    })) as TokenData;

    if (!token) {
      return CRBTError(this, {
        title: `This code is not a valid CRBT+ code or an API token.`,
        description: dedent`To purchase CRBT+, head over to **[the CRBT+ about page](${links.premiumPage})**.
        To learn more about the CRBT API, visit **[our documentation page](${links.docs.api})**.`,
      });
    }

    if (token.type === TokenTypes.API) {
      const decoded = decodeAPIToken(token.token);

      if (decoded.userId !== this.user.id && token.data.userId !== this.user.id) {
        return CRBTError(this, 'You are not authorized to use this token.');
      }

      await this.editReply({
        embeds: [
          {
            title: 'Your CRBT API token',
            description: dedent`You can use this token to interact with the **[CRBT API](${links.docs.api})**.
            It was created <t:${decoded.iat}:R>.
            :warning: **Warning:** Do not share this token with anyone.`,
            color: await getColor(this.user),
          },
        ],
      });

      await AchievementProgress.call(this, 'BREWING_APPS');
    }
    if (token.type === TokenTypes.Redeem) {
      if (token.data.redeemed) {
        return CRBTError(this, {
          title: `This CRBT+ code was already redeemed.`,
          description: `To purchase CRBT+, head over to **[the CRBT+ about page](${links.premiumPage})**.`,
        });
      }

      const expiresAt = token.data.monthsValue
        ? dayjs().add(token.data.monthsValue, 'month').toDate()
        : undefined;

      await prisma.token.update({
        where: { token: code },
        data: { data: { ...token.data, redeemed: true } },
      });

      const query = {
        transactionHistory: {
          create: {
            item: PurchasableTypes.PREMIUM,
            purchasedAt: new Date(),
            availableUntil: expiresAt,
            serverId: this.guildId,
          },
        },
        premiumExpiresAt: expiresAt,
      };

      await prisma.user.upsert({
        where: { id: this.user.id },
        create: {
          id: this.user.id,
          ...query,
        },
        update: query,
      });

      await prisma.servers.upsert({
        where: { id: this.guildId },
        create: {
          id: this.guildId,
          ...(expiresAt ? { premiumExpiresAt: expiresAt } : { hasPremium: true }),
        },
        update: expiresAt ? { premiumExpiresAt: expiresAt } : { hasPremium: true },
      });

      await this.editReply({
        embeds: [
          {
            title: `CRBT+ Redeemed on ${this.guild.name}!`,
            description: dedent`You'll now enjoy your **[CRBT+ User perks](${links.premiumPage})**!
            
            You've also unlocked CRBT+ Server perks for ${
              this.guild.name
            }, which will work for all members in this server.

            To switch which server gets your CRBT+ Server perks, use ${slashCmd(
              'redeem'
            )} again with your transaction ID.`,
            color: colors.success,
          },
        ],
      });
    }
  },
});

const decodeAPIToken = (token: string) => {
  try {
    const [userId, iat, _] = token
      .split('.')
      .slice(0, 2)
      .map((str) => Buffer.from(str, 'base64').toString());

    return {
      userId,
      iat: parseInt(iat),
    };
  } catch (e) {
    return null;
  }
};
