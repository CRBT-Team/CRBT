import { cache } from '$lib/cache';
import { colors, db, emojis, illustrations } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import canvas from 'canvas';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, OptionBuilder } from 'purplet';

const colorsMap = Object.entries(colors).map(([key, hex]) => ({
  key,
  fullName: key
    .replace('light', 'light ')
    .replace('dark', 'dark ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '),
  value: hex,
  private: !(emojis.colors[key] || hex === 'profile'),
  emoji: emojis.colors[key] || null,
}));

export const colorset = ChatCommand({
  name: 'color set',
  description: 'Changes your CRBT accent color.',
  options: new OptionBuilder()
    .string(
      'color',
      'Color to change your accent color to. Use one of the suggestions or a HEX color.',
      true
    )
    .autocomplete('color', ({ color }) => {
      return colorsMap
        .filter((colorObj) => !colorObj.private)
        .filter((colorObj) => colorObj.fullName.includes(color.toLowerCase()))
        .map((colorObj) => ({ name: colorObj.fullName, value: colorObj.value }));
    }),
  async handle({ color }) {
    const user = await this.client.users.fetch(this.user, { force: true });
    const text = color.toLowerCase().replaceAll(/ |#/g, '');
    const finalColor = colors[text] ? colors[text] : text;

    if (text.match(/^[0-9a-f]{6}$/) || colors[text]) {
      if (finalColor === colors.default) {
        cache.del(`color_${this.user.id}`);
        await db.profiles.update({
          data: { crbt_accent_color: null },
          where: { id: this.user.id },
        });
      } else {
        cache.set(`color_${user.id}`, `#${finalColor}`);
        await db.profiles.update({
          data: { crbt_accent_color: `#${finalColor}` },
          where: { id: user.id },
        });
      }
      await this.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.success} Accent color updated.`)
            .setDescription(
              "This color will be used across most of CRBT's replies to you, as well as on your profile and info cards, when someone else visits them."
            )
            .setColor(finalColor),
        ],
        ephemeral: true,
      });
    } else if (text === 'profile') {
      if (!user.hexAccentColor) {
        await this.reply(
          CRBTError(
            'You do not have a Discord profile color to sync from! To set one, edit your Discord User Profile and change your Profile Color.'
          )
        );
      } else {
        cache.set(`color_${user.id}`, 'profile');
        await db.profiles.update({
          data: { crbt_accent_color: 'profile' },
          where: { id: user.id },
        });
        await this.reply({
          embeds: [
            new MessageEmbed()
              .setTitle(`${emojis.success} Accent color updated.`)
              .setDescription(
                "Your Discord profile color will be synced to your CRBT accent color. This color will be used across most of CRBT's replies to you, as well as on your profile and info cards, when someone else visits them."
              )
              .setColor(user.hexAccentColor),
          ],
          ephemeral: true,
        });
      }
    } else {
      await this.reply(
        CRBTError(
          'You need to enter a valid or a color name. Use the command again with no options for more info.'
        )
      );
    }
  },
});

export const colorlist = ChatCommand({
  name: 'color list',
  description: 'Lists all CRBT color names.',
  async handle() {
    const userColor = await getColor(this.user);
    const colorRows = [[], [], []];
    const filteredColorsMap = colorsMap.filter(
      (colorObj) => !(colorObj.private || colorObj.value === 'profile')
    );

    filteredColorsMap.forEach((colorObj) => {
      let currentRow = 0;
      const maxLength = Math.round(filteredColorsMap.length / 3);

      if (colorRows[0].length >= maxLength) currentRow = 1;
      if (colorRows[1].length >= maxLength) currentRow = 2;

      colorRows[currentRow].push(`${colorObj.emoji} \`${colorObj.fullName}\``);
    });

    const img = canvas.createCanvas(512, 512);
    const ctx = img.getContext('2d');
    ctx.fillStyle = userColor;
    ctx.fillRect(0, 0, img.width, img.height);
    const e = new MessageEmbed()
      .setAuthor({ name: 'CRBT Settings - Accent color', iconURL: illustrations.settings })
      .setThumbnail(`attachment://color.png`)
      .setDescription(
        `**Current color:** \`${userColor}\`` +
          '\n' +
          "This color is used across most of CRBT's replies to you, as well as on your profile and info cards, when someone else visits them." +
          '\n' +
          'You can either choose one of these colors below or provide your own [HEX color value](https://htmlcolorcodes.com/color-picker/).' +
          '\n' +
          '**To change your accent color, use `/color set`**' +
          '\n' +
          'You can sync your CRBT accent color with your Discord profile color by using `/color set Discord Profile Color`.'
      )
      .setColor(userColor);

    colorRows.forEach((row) => {
      if (row.length !== 0) e.addField('‎', row.join('\n'), true);
    });

    await this.reply({
      embeds: [e],
      files: [new MessageAttachment(img.toBuffer(), 'color.png')],
      ephemeral: true,
    });
  },
});

export const EditColorBtn = ButtonComponent({
  async handle() {
    const userColor = await getColor(this.user);
    const colorRows = [[], [], []];
    const filteredColorsMap = colorsMap.filter(
      (colorObj) => !(colorObj.private || colorObj.value === 'profile')
    );

    filteredColorsMap.forEach((colorObj) => {
      let currentRow = 0;
      const maxLength = Math.round(filteredColorsMap.length / 3);

      if (colorRows[0].length >= maxLength) currentRow = 1;
      if (colorRows[1].length >= maxLength) currentRow = 2;

      colorRows[currentRow].push(`${colorObj.emoji} \`${colorObj.fullName}\``);
    });

    const img = canvas.createCanvas(512, 512);
    const ctx = img.getContext('2d');
    ctx.fillStyle = userColor;
    ctx.fillRect(0, 0, img.width, img.height);
    const e = new MessageEmbed()
      .setAuthor({ name: 'CRBT Settings - Accent color', iconURL: illustrations.settings })
      .setThumbnail(`attachment://color.png`)
      .setDescription(
        `**Current color:** \`${userColor}\`` +
          '\n' +
          "This color is used across most of CRBT's replies to you, as well as on your profile and info cards, when someone else visits them." +
          '\n' +
          'You can either choose one of these colors below or provide your own [HEX color value](https://htmlcolorcodes.com/color-picker/).' +
          '\n' +
          '**To change your accent color, use `/color set`**' +
          '\n' +
          'You can sync your CRBT accent color with your Discord profile color by using `/color set Discord Profile Color`.'
      )
      .setColor(userColor);

    colorRows.forEach((row) => {
      if (row.length !== 0) e.addField('‎', row.join('\n'), true);
    });

    await this.reply({
      embeds: [e],
      files: [new MessageAttachment(img.toBuffer(), 'color.png')],
      ephemeral: true,
    });
  },
});
