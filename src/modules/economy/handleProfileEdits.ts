import { colors, emojis, local } from '$lib/db';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { ButtonInteraction, InteractionWebhook, MessageEmbed } from 'discord.js';
import { OnEvent } from 'purplet';

interface ModalSubmitField {
  type: 'TEXT_INPUT';
  customId: string;
  value: string;
}

interface ModalInteraction extends ButtonInteraction {
  version: number;
  fields: ModalSubmitField[];
  webhook: InteractionWebhook;
  getTextInputValue: (id: string) => string;
}

//@ts-ignore
export default OnEvent('modalSubmit', async (modal: ModalInteraction) => {
  const username = modal.getTextInputValue('profile_username');
  const bio = modal.getTextInputValue('profile_bio');
  // console.log(await modal.fetchReply());

  const msg = await modal.channel.messages.fetch(modal.customId);
  const { author, color, fields, image, thumbnail, title } = msg.embeds[0];

  const profile: APIProfile = await local.get(`profile.${modal.user.id}`);

  if (profile) {
    await local.set(`profile.${modal.user.id}`, {
      crbt_badges: profile.crbt_badges,
      crbt_banner: profile.crbt_banner,
      crbt_accent_color: profile.crbt_accent_color,
      purplets: profile.purplets,
      verified: profile.verified,
      bio,
      username,
    } as APIProfile);
  } else {
    await local.set(`profile.${modal.user.id}`, {
      bio,
      username,
    });
  }

  msg.edit({
    embeds: [
      new MessageEmbed({
        author,
        fields,
        image,
        color,
        thumbnail,
      })
        .setTitle(username ?? title)
        .setDescription(bio ?? "*This user doesn't have a bio yet...*"),
    ],
  });

  modal
    .reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emojis.success} Profile updated!`)
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    })
    .then(() => setTimeout(() => modal.deleteReply(), 200))
    .catch(() => {});
});
