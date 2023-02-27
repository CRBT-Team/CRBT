import { components, ModalComponent, row } from 'purplet';
import { renderPoll } from '../functions/renderPoll';
import { getPollData } from '../_helpers';

export const EditPollModal = ModalComponent({
  async handle(msgId: string) {
    const title = this.fields.getTextInputValue('poll_title');
    const choices = this.components.slice(1).map((_, i) => {
      return this.fields.getTextInputValue(`poll_option_${i}`);
    });
    console.log(choices);

    const msg = await this.channel.messages.fetch(msgId);
    const poll = await getPollData(`${this.channelId}/${msgId}`);
    const pollEmbed = await renderPoll.call(this, poll, null, {
      editedAt: new Date(),
      title,
      choices,
    });

    await msg.edit({
      ...pollEmbed,
      components: components(
        row().addComponents(
          //@ts-ignore
          msg.components[0].components.slice(0, -1).map((component, i) => ({
            ...component,
            label: choices[i],
          })),
          msg.components[0].components.at(-1)
        )
      ),
    });

    //@ts-ignore
    await this.update({});
  },
});
