import getColors from 'get-image-colors';
import { fetch } from 'undici';

export async function imgDominantColor(imageUrl: string) {
  const buffer = await (await fetch(imageUrl)).arrayBuffer();

  const averageColor = (
    await getColors(Buffer.from(buffer), {
      type: 'image/png',
      count: 1,
    })
  )?.[0];

  return averageColor;
}
