import { db, links } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { AchievementProgress } from '$lib/responses/Achievements';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

interface APITokenData {
  userId: string;
  guildId?: string;
}

interface RedeemTokenData {
  type: 'BetaAccess1Month' | 'BetaAccess12Months';
  output: string;
}

export default ChatCommand({
  name: 'redeem',
  description: 'Use a compatible CRBT token to redeem a reward or unlock something.',
  options: new OptionBuilder().string(
    'token',
    'A CRBT redeem token, API token, or other kind of giveaway code.',
    { required: true }
  ),
  async handle({ token: tokenString }) {
    await this.deferReply({
      ephemeral: true,
    });

    const token = await db.tokens.findUnique({
      where: {
        token: tokenString,
      },
    });

    if (!token) {
      return this.editReply(
        CRBTError(
          `"${token}" is not a valid token. For more info about redeemable tokens, check this [article](${links.blog.crbtTokens})`
        )
      );
    }

    if (token.type === 'API') {
      const data = token.data as any as APITokenData;
      const decoded = decodeAPIToken(token.token);

      if (decoded.userId !== this.user.id && data.userId !== this.user.id) {
        return this.editReply(CRBTError('You are not authorized to use this token.'));
      }

      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle('CRBT API Token')
            .setDescription(
              `This is your CRBT API Token, which you can use to interact with the CRBT API.\n` +
                `It was created <t:${decoded.iat}:R>.\n` +
                `CRBT API docs can be found [here](${links.docs.api}).\n` +
                `:warning: **Warning:** Do not share your API token with anyone.`
            )
            .setColor(await getColor(this.user)),
        ],
      });

      await AchievementProgress.call(this, 'BREWING_APPS');
    }
    if (token.type === 'REDEEM') {
      const data = token.data as any as RedeemTokenData;

      await this.reply(data.output);
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
