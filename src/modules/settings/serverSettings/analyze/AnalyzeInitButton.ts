import { emojis } from '$lib/env';
import { MessageAttachment, MessageButton } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { BackSettingsButton } from '../settings';
import { createAnalysisMessage } from './_helpers';

export const AnalyzeInitButton = ButtonComponent({
  async handle() {
    await this.update({
      embeds: [
        {
          author: this.message.embeds[0].author,
          title: 'Fetching server data and gathering the perfect tips!',
          description: 'This will roughly take 1 minute, please stay patient.',
          color: this.message.embeds[0].color,
        },
      ],
      components: components(
        row(
          new MessageButton({
            customId: 'hello',
            disabled: true,
            style: 'SECONDARY',
            label: 'Loading...',
          })
        )
      ),
    });

    const { chatCompletion, serverInfo } = await createAnalysisMessage.call(this);

    await this.editReply({
      files: [new MessageAttachment(Buffer.from(serverInfo), 'server-info-prompt.txt')],
      embeds: [
        {
          author: this.message.embeds[0].author,
          title: `Server Analysis - Results [BETA]`,
          footer: {
            text: 'Powered by OpenAI GPT-3.5 • Suggestions may be inaccurate',
          },
          description: chatCompletion.data.choices[0].message.content,
          color: this.message.embeds[0].color,
          fields: [
            {
              name: 'Tokens',
              value: `Prompt: ${chatCompletion.data.usage.prompt_tokens}, Completion: ${chatCompletion.data.usage.completion_tokens}, Total: ${chatCompletion.data.usage.total_tokens}.`,
            },
          ],
        },
      ],
      components: components(
        row(new BackSettingsButton(null).setStyle('SECONDARY').setEmoji(emojis.buttons.left_arrow))
      ),
    });
  },
});
