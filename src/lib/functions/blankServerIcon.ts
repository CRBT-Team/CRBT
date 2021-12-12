import { colors } from '$lib/db';
import canvas from 'canvas';

export function blankServerIcon(guildAcronym: string) {
  canvas.registerFont('data/misc/whitney.otf', { family: 'Whitney' });
  const img = new canvas.Canvas(512, 512);
  const ctx = img.getContext('2d');
  ctx.fillStyle = `#${colors.blurple}`;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 152px Whitney';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(guildAcronym, 256, 256);
  return img.toBuffer();
}
