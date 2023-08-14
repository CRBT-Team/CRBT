import { imgDominantColor } from '$lib/functions/imgDominantColor';
import { OnEvent } from 'purplet';
import { getGuildSettings, saveServerSettings } from '../settings/server-settings/_helpers';

export default OnEvent('guildUpdate', async (oldGuild, newGuild) => {
  if (oldGuild.icon === newGuild.icon) return;

  const { isAutoThemingEnabled } = await getGuildSettings(newGuild.id);

  if (!isAutoThemingEnabled) return;

  const guildIcon = newGuild.iconURL({ format: 'png' });
  const dominantColor = (await imgDominantColor(guildIcon)).num();

  await saveServerSettings(newGuild.id, {
    iconHash: newGuild.icon,
    accentColor: dominantColor,
  });
});
