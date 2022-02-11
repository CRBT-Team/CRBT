export const youtubeUrl =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
export const soundCloudUrl = /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;
export const clembsWatchUrl =
  /^(?:https?):\/\/?(?:(?:www|m)\.)?clembs.xyz\/(?:watch|videos)\/(.*)\.mp4$/;

export const shortenUrl = (url: string) => {
  if (youtubeUrl.test(url)) {
    const short = url.replace(youtubeUrl, 'yt:$6');
    console.log(short);
    return short;
  } else if (soundCloudUrl.test(url)) {
    const short = url.replace(soundCloudUrl, 'sc:$3');
    console.log(short);
    return short;
  } else if (clembsWatchUrl.test(url)) {
    const short = url.replace(clembsWatchUrl, 'cw:$1');
    console.log(short);
    return short;
  } else {
    console.log(url.match(clembsWatchUrl));
    return url;
  }
};
