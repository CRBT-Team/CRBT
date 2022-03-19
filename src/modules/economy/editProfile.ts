import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { showModal } from '$lib/functions/showModal';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { ButtonComponent } from 'purplet';

export const EditProfileBtn = ButtonComponent({
  async handle(userId: string) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('You can only edit your own profile.'));
    }

    const profile = await db.profiles.findFirst({
      where: { id: userId },
      select: { name: true, bio: true, url: true, birthday: true, location: true },
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
            .setPlaceholder('A unique name, can only have letters, numbers or spaces.')
            .setValue(profile?.name ?? '')
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
            .setValue(profile?.bio ?? '')
            .setMinLength(10)
            .setMaxLength(150)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_url')
            .setLabel('Website')
            .setStyle('SHORT')
            .setPlaceholder('A link to your website, blog, Twitter...')
            .setValue(profile?.url ?? '')
            .setMinLength(3)
            .setMaxLength(50)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_birthday')
            .setLabel('Birthday')
            .setStyle('SHORT')
            .setPlaceholder('YYYY-MM-DD')
            .setValue(profile?.birthday?.toISOString()?.split('T')[0] ?? '')
            .setMinLength(10)
            .setMaxLength(10)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_location')
            .setLabel('Location')
            .setStyle('SHORT')
            .setPlaceholder('Where are you from?')
            .setValue(profile?.location ?? '')
            .setMinLength(3)
            .setMaxLength(20)
        )
      );

    await showModal(modal, this);

    // await getRestClient().post(`/interactions/${this.id}/${this.token}/callback`, {
    //   body: {
    //     type: 9,
    //     data: modal.toJSON(),
    //   },
    //   headers: {
    //     Authorization: `Bot ${this.client.token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
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
