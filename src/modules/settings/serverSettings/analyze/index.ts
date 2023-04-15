import { SettingsMenus } from '$lib/types/settings';
import { components, row } from 'purplet';
import { AnalyzeInitButton } from './AnalyzeInitButton';

export const serverAnalyzeSettings: SettingsMenus = {
  getComponents({ backBtn }) {
    return components(
      row(
        backBtn,
        new AnalyzeInitButton().setLabel('Analyze Server').setStyle('PRIMARY').setEmoji('✨')
      )
    );
  },
  getMenuDescription({ settings }) {
    return {
      description:
        '⚠️ This feature is in early beta stages and can be inaccurate and give incomplete suggestions. Thanks for agreeing to be part of this program.\n' +
        'Get tips and suggestions to make your server the best it can be, powered by robust AI models!',
      fields: [
        {
          name: 'How does it work?',
          value: [
            "• CRBT scans your server's member count, channels, roles, CRBT settings.",
            "• This data is then sent to a version of OpenAI's **[GPT-3.5](https://openai.com/blog/introducing-chatgpt-and-whisper-apis)** trained with heavy Discord server management knowledge.",
            '• The AI model returns a brief of what you did good, as well as a few key suggestions to improve your server.',
          ].join('\n'),
        },
        {
          name: 'Transparency information',
          value: [
            '• An entire list of what data is sent is in the works, and the entire source code is free to be looked at.',
            '• Paid options are coming for further analysis, and more server data such as chat activity, recent events, or crawling the rules channel.',
            '• These paid options will help sustain the base free feature, as GPT itself is not free and get pricier as you send more data.',
          ].join('\n'),
        },
      ],
    };
  },
  getOverviewValue: () => ({
    value: 'Free tier',
    icon: '✨',
  }),
  newLabel: true,
  getSelectMenu() {
    return {
      emoji: '✨',
      label: 'Server Analysis [NEW]',
      description: 'Get solid server improvement tips in a minute!',
    };
  },
};
