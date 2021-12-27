import { colors } from '$lib/db';
import canvas from 'canvas';

export function blankServerIcon(guildAcronym: string) {
  canvas.registerFont('data/misc/whitney.otf', { family: 'Whitney' });
  const img = canvas.createCanvas(512, 512);
  const ctx = img.getContext('2d');
  ctx.fillStyle = `#${colors.blurple}`;
  ctx.fillRect(0, 0, img.width, img.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'normal 152px Whitney';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(guildAcronym, 256, 256);
  return img.toBuffer();
}
