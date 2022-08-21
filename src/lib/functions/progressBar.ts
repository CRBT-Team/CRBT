import { emojis } from '$lib/db';

export function progressBar(percentage: number) {
  return (
    `${emojis.progress.fill}.`.repeat(Math.round(percentage / 10)) +
    `${emojis.progress.empty}.`.repeat(10 - Math.round(percentage / 10))
  )
    .split('.')
    .map((e, i) => {
      if (i === 0) {
        if (e === emojis.progress.empty) {
          return emojis.progress.emptystart;
        } else if (e === emojis.progress.fill) {
          return emojis.progress.fillstart;
        }
      } else if (i === 9) {
        if (e === emojis.progress.empty) {
          return emojis.progress.emptyend;
        } else if (e === emojis.progress.fill) {
          return emojis.progress.fillend;
        }
      } else {
        return e;
      }
    })
    .join('')
    .replace(
      `${emojis.progress.fillstart}${emojis.progress.empty}`,
      `${emojis.progress.fillstartcut}${emojis.progress.empty}`
    )
    .replace(
      `${emojis.progress.fill}${emojis.progress.empty}`,
      `${emojis.progress.fillcut}${emojis.progress.empty}`
    )
    .replace(
      `${emojis.progress.fill}${emojis.progress.emptyend}`,
      `${emojis.progress.fillcut}${emojis.progress.emptyend}`
    );
}
