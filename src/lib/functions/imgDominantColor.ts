import chroma from 'chroma-js';
import { extractColors } from 'extract-colors';
import { FinalColor } from 'extract-colors/lib/types/Color';
import getPixels from 'get-pixels';
import { fetch } from 'undici';

export async function imgDominantColor(imageUrl: string) {
  const buffer = await (await fetch(imageUrl)).arrayBuffer();
  let averageColor: FinalColor;

    getPixels(Buffer.from(buffer), 'image/png', async (err, pixels) => {
      if (!err) {
        const data = [...pixels.data];
        const width = Math.round(Math.sqrt(data.length / 4));
        const height = width;

        averageColor = (await extractColors({ data, width, height }))?.[0];
      }
    })

  return chroma(averageColor.hex);
}
