import { colors, emojis, illustrations } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getVar } from '$lib/functions/getVar';
import { setVar } from '$lib/functions/setVar';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'set-color',
  description:
    'Gives information about your color, or changes it if any color name/hex code is given.',
  options: new OptionBuilder().string(
    'color',
    'The color you want to set your thing to. Leave blank to get a list of colors.'
  ),
  async handle({ color }) {
    if (color) {
      const user = await this.client.users.fetch(this.user, { force: true });
      console.log(user);
      const text = color.toLowerCase().replaceAll(/ |#/g, '');
      const finalColor = colors[text] ? colors[text] : text;

      if (text.match(/^[0-9a-f]{6}$/) || colors[text]) {
        await setVar('color', this.user.id, finalColor);
        await this.reply({
          embeds: [
            new MessageEmbed()
              .setTitle(`${emojis.success} Access color updated.`)
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
              'custom',
              'You do not have a Discord profile color to sync from! To set one, go to your Discord "User Profile" settings and click the color picker below "Profile Color".'
            )
          );
        } else {
          await setVar('color', user.id, 'profile');
          await this.reply({
            embeds: [
              new MessageEmbed()
                .setTitle(`${emojis.success} Access color updated.`)
                .setDescription(
                  "Your Discord profile color will be synced to your access color. This color will be used across most of CRBT's replies to you, as well as on your profile and info cards, when someone else visits them."
                )
                .setColor(user.hexAccentColor),
            ],
            ephemeral: true,
          });
        }
      } else {
        await this.reply(
          CRBTError(
            'custom',
            'You need to enter a valid or a color name. Use the command again with no options for more info.'
          )
        );
      }
    } else {
      const userColor = await getVar('color', this.user.id);
      const filteredColors = Object.entries(colors).filter((value) => emojis.colors[value[0]]);
      const formattedColorList = [[], [], []];
      for (const [name, hex] of filteredColors) {
        let currentIndex = 0;
        const maxLength = Math.round(filteredColors.length / 3);
        if (formattedColorList[0].length === maxLength) currentIndex = 1;
        if (formattedColorList[1].length === maxLength) currentIndex = 2;

        formattedColorList[currentIndex].push(
          `${emojis.colors[name]} \`${(
            name.charAt(0).toUpperCase() +
            name.replace('light', 'light ').replace('dark', 'dark ').slice(1)
          ).replace('Light red', 'Light red - Default')}\``
        );
      }
      const e = new MessageEmbed()
        .setAuthor('CRBT Settings - Accent color', illustrations.settings)
        .setThumbnail(`https://api.clembs.xyz/other/color${userColor}`)
        .setDescription(
          `**Current color:** \`#${userColor}\`` +
            '\n' +
            "This color is used across most of CRBT's replies to you, as well as on your profile and info cards, when someone else visits them." +
            '\n' +
            'You can either choose one of these colors below or use your own [hexadecimal color](https://htmlcolorcodes.com/color-picker/).' +
            '\n' +
            'You can sync your CRBT accent color with your Discord profile color by using `/set-color profile`.'
        )
        .setColor(`#${userColor}`);
      for (const colors of formattedColorList) {
        e.addField('‎', colors.join('\n'), true);
      }

      await this.reply({
        embeds: [e],
        ephemeral: true,
      });
    }
  },
});
