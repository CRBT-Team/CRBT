import { colors, db, emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { CRBTscriptParser } from '$lib/functions/CRBTscriptParser';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { MessageEmbed, ModalSubmitInteraction } from 'discord.js';
import { OnEvent } from 'purplet';

//@ts-ignore
export default OnEvent('modalSubmit', async (modal: ModalSubmitInteraction) => {
  const name = modal.fields.getTextInputValue('profile_name');
  const bio = modal.fields.getTextInputValue('profile_bio');

  const msg = await modal.channel.messages.fetch(modal.customId);
  const { author, color, fields, image, thumbnail, title } = msg.embeds[0];

  const profile = (await db.profiles.findFirst({
    where: { id: modal.user.id },
  })) as APIProfile;

  try {
    if (profile) {
      await db.profiles.update({
        data: {
          name,
          bio,
        },
        where: { id: modal.user.id },
      });
    } else {
      await db.profiles.create({
        data: {
          id: modal.user.id,
          name,
          bio,
          purplets: 0,
        },
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
          .setTitle(name + (profile?.verified ? ` ${emojis.partner}` : ''))
          .setDescription(
            bio
              ? await CRBTscriptParser(bio, modal.user, modal.guild)
              : "*This user doesn't have a bio yet...*"
          ),
      ],
    });

    modal.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emojis.success} Profile updated!`)
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });
    // .then(() => setTimeout(() => modal.deleteReply(), 1000))
    // .catch(() => {});
  } catch (error) {
    if (String(error).includes('Unique constraint failed on the fields: (`name`)')) {
      modal
        .reply(CRBTError('This profile name is already taken.', 'An error occured!', null, false))
        .then(() => setTimeout(() => modal.deleteReply(), 1000));
    }
  }
});
