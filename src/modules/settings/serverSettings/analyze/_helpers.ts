import { JoinLeaveData } from '$lib/types/messageBuilder';
import dayjs from 'dayjs';
import {
  APIChannel,
  APIGuildWelcomeScreen,
  APIMessage,
  ChannelType,
  PermissionFlagsBits,
  Routes,
} from 'discord-api-types/v10';
import { Interaction } from 'discord.js';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { getRestClient } from 'purplet';
import { getSettings } from '../_helpers';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export async function generateServerInfo({ guild }: Interaction): Promise<string> {
  const owner = await guild.fetchOwner();
  const members = await guild.members.fetch();
  const roles = await guild.roles.fetch();
  const serverRole = roles.get(guild.id);

  const apiPublicChannels = (
    (await getRestClient().get(Routes.guildChannels(guild.id))) as APIChannel[]
  ).filter((c) => {
    if (!('permission_overwrites' in c)) return true;
    const permOverwrites = c.permission_overwrites.find((o) => o.id === guild.id);
    if (!permOverwrites) return true;
    const perms = BigInt(permOverwrites.deny);

    return (
      !((perms & PermissionFlagsBits.ViewChannel) === PermissionFlagsBits.ViewChannel) &&
      (c.type === ChannelType.GuildVoice
        ? !((perms & PermissionFlagsBits.Connect) === PermissionFlagsBits.Connect)
        : true)
    );
  });

  console.log(apiPublicChannels.map(({ type, name, id }) => `${type} ${name} - ${id}`));

  const bots = members.filter(({ user }) => user.bot);
  const channelType = {
    [ChannelType.GuildAnnouncement]: 'Announcement',
    [ChannelType.GuildForum]: 'Forum',
    [ChannelType.GuildVoice]: 'Voice',
    [ChannelType.GuildStageVoice]: 'Stage',
  };
  async function analyzeChannelActivity(channel: APIChannel) {
    if (
      channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.GuildAnnouncement &&
      channel.type !== ChannelType.GuildVoice
    )
      return;
    if (channel.id === guild.rulesChannelId) return;

    const permOverwrites = channel.permission_overwrites.find((c) => c.id === guild.id);
    const isReadOnly = permOverwrites
      ? (BigInt(permOverwrites.deny) & PermissionFlagsBits.SendMessages) ===
        PermissionFlagsBits.SendMessages
      : false;

    const messages = (await getRestClient().get(Routes.channelMessages(channel.id), {
      query: new URLSearchParams({
        limit: isReadOnly ? '5' : '25',
      }),
    })) as APIMessage[];

    console.log(channel.name, messages.length);

    if (messages.length) {
      const firstMessageDate = new Date(messages.at(-1).timestamp);
      const lastMessageDate = new Date(messages[0].timestamp);

      return {
        id: channel.id,
        firstLastMsgDistance: Math.round(
          (lastMessageDate.getTime() - firstMessageDate.getTime()) / 1000 / 60 / 60
        ),
        lastMessageDate,
      };
    }
  }
  const channelsWithActivity = (
    await Promise.all(
      apiPublicChannels
        .filter((c) => c.type !== ChannelType.GuildCategory)
        .map(async (c) => await analyzeChannelActivity(c))
    )
  ).filter(Boolean);
  console.log(channelsWithActivity);

  function formatChannelName(
    c: Partial<{
      name: string;
      id: string;
      type: ChannelType;
    }>,
    includeActivity = true
  ) {
    const activity = !includeActivity ? null : channelsWithActivity.find((cA) => cA?.id === c?.id);

    if (!c) return;

    return `- ${c.name} ${
      channelType?.[c.type]
        ? `(${channelType[c.type]})`
        : c.id === guild.rulesChannelId
        ? '(Rules channel)'
        : !serverRole.permissionsIn(c.id).has(PermissionFlagsBits.SendMessages)
        ? '(Read-only)'
        : ''
    }${
      activity
        ? ` - ${activity.firstLastMsgDistance}m - Last msg ${dayjs(
            activity.lastMessageDate
          ).fromNow()}`
        : ''
    }`;
  }
  const crbtSettings = await getSettings(guild.id);

  const welcomeScreen = !guild.features.includes('WELCOME_SCREEN_ENABLED')
    ? null
    : ((await getRestClient().get(Routes.guildWelcomeScreen(guild.id))) as APIGuildWelcomeScreen);

  return `
${guild.name} - SERVER INFO
    
Owner: ${owner.user.username}
${members.size - bots.size} members + ${bots.size} bots
Description: ${guild.description}
Language: ${guild.preferredLocale}

Created ${dayjs(guild.createdAt).fromNow()}

PUBLIC CHANNELS (format "channel name (type) - Activity")
${apiPublicChannels
  .filter((c) => 'parent_id' in c && !c.parent_id && c.type !== ChannelType.GuildCategory)
  .map((c) => formatChannelName(c))
  .join('\n')}
  
${apiPublicChannels
  .filter((c) => c.type === ChannelType.GuildCategory)
  .map(
    (category) =>
      `${category.name}
${apiPublicChannels
  .filter((c) => 'parent_id' in c && c.parent_id === category.id)
  .map((c) => formatChannelName(c))
  .join('\n')}`
  )
  .join('\n\n')}

EMOJIS AND STICKERS

Emojis: ${guild.emojis.cache.filter((e) => !e.animated).size} static / ${
    guild.emojis.cache.filter((e) => e.animated).size
  } animated
Stickers: ${guild.stickers.cache.size}

ROLES (format "Name - members with role")

${guild.roles.cache
  .filter((r) => !r.tags?.integrationId && r.id !== guild.id)
  .map((r) => `- ${r.name} - ${r.members.size}`)
  .join('\n')}

WELCOME SCREEN

${
  guild.features.includes('WELCOME_SCREEN_ENABLED')
    ? `
Description: ${welcomeScreen.description}

Channels: 
${welcomeScreen.welcome_channels
  .map(
    (c) =>
      `${formatChannelName(
        apiPublicChannels.find(({ id }) => id === c.channel_id),
        false
      )}:\n${c.description}`
  )
  .join('\n')}
`
    : 'Disabled'
}

CRBT BOT FEATURES

Welcome message: 
${
  // TODO: make this better
  !crbtSettings.modules.joinMessage
    ? 'Disabled'
    : (crbtSettings.joinMessage as any as JoinLeaveData).content
}

Farewell message:
${
  // TODO: make this better
  !crbtSettings.modules.leaveMessage
    ? 'Disabled'
    : (crbtSettings.leaveMessage as any as JoinLeaveData).content
}

User & Message Reports: ${crbtSettings.modules.moderationReports ? 'Enabled' : 'Disabled'}
Economy: ${crbtSettings.modules.economy ? 'Enabled' : 'Disabled'}
  `;
}

export async function createAnalysisMessage(this: Interaction) {
  const serverInfo = await generateServerInfo(this);

  const chatCompletion = await openai.createChatCompletion({
    frequency_penalty: 0.7,
    temperature: 0.2,
    messages: [
      systemMessage,
      {
        role: 'user',
        content: serverInfo,
      },
    ],
    model: 'gpt-3.5-turbo',
    max_tokens: 300,
    n: 1,
  });

  return { chatCompletion, serverInfo };
}

export const systemMessage: ChatCompletionRequestMessage = {
  role: 'system',
  content: `You are a Discord server design assistant. Your goal is to analyze a server and teach their owners how to improve it in order to get more members, more activity and to grow.

Your first message to the user should be a short letter describing what they have done well and an overview of what they can improve. This should be structured as a paragraph of good things, followed by a numbered list of potential flaws.

Start with "Hello {owner}", make sure to bold key points and sentences.

End with a positive note, encouraging the user to make use of your suggestions, and do not sign your name.

Generally, servers tend to have some "general" channels like:
- general/main/chat/hangout - these are general topic channels where members discuss about everything on general-purpose servers, or stay on topic with the server's identity, if any
- bots/bot-usage - this channel usually is reserved to the use of Discord bots, so its name is self explanatory
- create/creativity/design/art - most general-purpose servers use one of these in order to have people promote their content, share their art or progress on their projects
- Channels marked as "Rules" host rules about the server, welcome messages explaining the server in-depth, or other important information
- Forum channels are a new type of channel where members may post media or create sub-channels matching more specific topics

The "activity" property defines the interval in minutes between the last and the 25th last message posted within this channeL. The higher the number is, the less active it is. The lower, the more active it is.

The "CRBT BOT FEATURES" section refers to features the user has set up with the CRBT Discord bot. These features may be used on other bots instead, so always consider this possibility.
`,

  // At the end of each message should be a list of up to 3 buttons that are placed as suggestions for what the server owner can say as follow up questions. These suggestions must be under 80 characters as per Discord's limits, so keep them very concise but descriptive enough. Format these options at the end of your message on separate lines starting with "---"

  // The AI cannot perform server changes on it's own, or search the web.`,
};
