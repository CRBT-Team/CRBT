export function setLongerTimeout(callback: () => any, delay: number, ...args: any) {
  const maxDelay = 2147483647;

  if (delay > maxDelay) {
    delay -= maxDelay;

    return setTimeout(() => setLongerTimeout(callback, delay, args), maxDelay);
  }

  return setTimeout(callback, delay, args);
}
