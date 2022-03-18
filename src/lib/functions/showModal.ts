import { Interaction, Modal } from 'discord.js';
import { getRestClient } from 'purplet';

export const showModal = async (modal: Modal, ctx: Interaction) => {
  await getRestClient().post(`/interactions/${ctx.id}/${ctx.token}/callback`, {
    body: {
      type: 9,
      data: modal.toJSON(),
    },
    headers: {
      Authorization: `Bot ${ctx.client.token}`,
      'Content-Type': 'application/json',
    },
  });
};
