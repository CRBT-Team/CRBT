import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { ButtonComponent, getRestClient } from 'purplet';

export const EditProfileBtn = ButtonComponent({
  async handle(userId: string) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('You can only edit your own profile.'));
    }

    const { bio, name } = await db.profiles.findFirst({
      where: { id: userId },
      select: { name: true, bio: true },
    });

    const modal = new Modal()
      .setTitle('Edit Profile')
      .setCustomId(this.message.id)
      .setComponents(
        //@ts-ignore
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_name')
            .setLabel('Name')
            .setStyle('SHORT')
            .setPlaceholder('Your CRBT profile name, should be unique.')
            .setValue(name)
            .setMinLength(3)
            .setMaxLength(20)
            .setRequired(true)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_bio')
            .setLabel('Bio')
            .setStyle('PARAGRAPH')
            .setPlaceholder('Tell us about yourself. CRBTscript tags accepted.')
            .setValue(bio)
            .setMinLength(10)
            .setMaxLength(150)
        )
      );

    await getRestClient().post(`/interactions/${this.id}/${this.token}/callback`, {
      body: {
        type: 9,
        data: modal.toJSON(),
      },
      headers: {
        Authorization: `Bot ${this.client.token}`,
        'Content-Type': 'application/json',
      },
    });
  },
});

export const EditPronounsBtn = ButtonComponent({
  handle() {
    const pronouns = this.message.embeds[0].fields.find((f) => f.name === 'Pronouns').value;
    this.reply({
      content:
        `**${this.client.user.username}** gets pronoun data from the open **[PronounDB](<https://pronoundb.org/>)** service.\n` +
        (pronouns === 'Unspecified'
          ? '**[Register an account](<https://pronoundb.org/register>)** with Discord to display your pronouns on your CRBT profile!'
          : `You can edit your pronouns from the **[My Account page](<https://pronoundb.org/me>)**.`),
      ephemeral: true,
    });
  },
});
