import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { formatEmojiURL } from '@purplet/utils';
import chroma from 'chroma-js';
import colors from './colors';

const emojis = {
  red: {
    thumbsdown: '<:thumbsdown:1065281274329182319>',
    thumbsup: '<:thumbsup:1065281276946415617>',
    toggleon: '<:toggleon:1065281281715347466>',
    settings: '<:settings:1065306493177573396>',
  },
  orange: {
    thumbsdown: '<:thumbsdown:1065314150827442296>',
    thumbsup: '<:thumbsup:1065314152169615371>',
    toggleon: '<:toggleon:1065314156665917622>',
    settings: '<:settings:1065314147589431417>',
  },
  yellow: {
    thumbsdown: '<:thumbsdown:1065314430721736754>',
    thumbsup: '<:thumbsup:1065314432382668841>',
    toggleon: '<:toggleon:1065314436899950712>',
    settings: '<:settings:1065314427831865385>',
  },
  blue: {
    thumbsdown: '<:thumbsdown:1065347354007441468>',
    thumbsup: '<:thumbsup:1065347355592896612>',
    toggleon: '<:toggleon:1065347357086077090>',
    settings: '<:settings:1065347351453106217>',
  },
  green: {
    thumbsdown: '<:thumbsdown:1065298484686770299>',
    thumbsup: '<:thumbsup:1065298485865365587>',
    toggleon: '<:toggleon:1065298489673789522>',
    settings: '<:settings:1065306807230279800>',
  },
  blurple: {
    thumbsdown: '<:thumbsdown:1065302732950483025>',
    thumbsup: '<:thumbsup:1065302734246531134>',
    toggleon: '<:toggleon:1065306696609697862>',
    settings: '<:settings:1065306692138586183>',
  },
  purple: {
    thumbsdown: '<:thumbsdown:1065314570874396752>',
    thumbsup: '<:thumbsup:1065314572350803968>',
    toggleon: '<:toggleon:1065314576511545364>',
    settings: '<:settings:1065314568043249817>',
  },
  pink: {
    thumbsdown: '<:thumbsdown:1065314225519599757>',
    thumbsup: '<:thumbsup:1065314228426256384>',
    toggleon: '<:toggleon:1065314232851243059>',
    settings: '<:settings:1065314224085139589>',
  },
  gray: {
    thumbsdown: '<:thumbsdown:1065349393672323092>',
    thumbsup: '<:thumbsup:1065349395450699806>',
    toggleon: '<:toggleon:1065349397916946452>',
    settings: '<:settings:1030989527235428402>',
  },
  error: '<:error:1035880321901674596> ',
  success: '<:success:1035880323482931230>',
  pending: '<:pending:1035314617532039279>',
  sticker: '<:sticker:970753754704007218>',
  emoji: '<:emoji:970653903664349214>',
  event: '<:event:970653903760814160>',
  role: '<:role:970752908536709271>',
  slash_command: '<:slash_command:970752908255698998>',
  thumbsup: '<:thumbsup:1030989520725889105>',
  thumbsdown: '<:thumbsdown:1030989519421456405>',
  reminder: '<:reminder_circle:1035314614835105863>',
  trash_bin: '<:trash_bin:970980243030540308>',
  pencil: '<:pencil:970980242560794686>',
  menu: '<:menu:970980242925711402>',
  tada: '<:tada:1000761543350296626>',
  lock: '<:locked:1003323812651212860>',
  toggle: {
    on: '<:toggleon:1035314618983256215>',
    off: '<:toggleoff:1035314620434493520>',
    fon: '<:forcedon:866042868766736394>',
    foff: '<:forcedoff:866042899501940757>',
  },
  buttons: {
    pencil: '<:pencil_white:970980243013779536>',
    trash_bin: '<:trash_bin_white:970980243097677874>',
    menu: '<:menu_white:970980243047350302>',
    cross: '<:cross_white:971363011308707840>',
    left_arrow: '<:left_arrow_white:987721485978304514>',
    right_arrow: '<:right_arrow_white:987721488557801552>',
    preview: '<:preview_white:987721487467302982>',
    add: '<:add_white:1000780051370999839>',
    skip_first: '<:skip_first:1034898718689873991>',
    skip_last: '<:skip_last:1034898716613677086>',
  },
  channels: {
    text: '<:text_channel:970653903681114182>',
    voice: '<:voice_channel:970653903869861888>',
    news: '<:news_channel:970653903819513905>',
    forum: '<:forum_channel:970653903613997106>970653903613997106>',
    rules: '<:rules_channel:970653903622373417>',
    nsfw: '<:nsfw_channel:970653903395913779>',
    category: '<:category:970653903039381595>',
    stage: '<:stage_channel:970653903500754945>',
    chat: '<:chat:970653903769182238>',
    thread_text: '<:text_thread:970653903811145768>',
    home: '<:home:970653904050204703>',
  },
  members: '<:members:970653903605616700>',
  bot: '<:bot:970653903043588177>',
  boosting: {
    '1': '<:boosting_lvl1:970653903521726524>',
    '2': '<:boosting_lvl2:970653903442042930>',
    '3': '<:boosting_lvl3:970653903559483452>',
  },
  status: {
    dnd: '<:DND:782585535008735233>',
    idle: '<:Idle:782585660682928149>',
    online: '<:Online:782585660334669854>',
    invisible: '<:Invisible:782585661185589270>',
  },
  badges: {
    houses: {
      balance: '<:balance:585763004574859273>',
      brilliance: '<:brilliance:585763004495298575>',
      bravery: '<:bravery:585763004218343426>',
    },
    nitro: '<:nitro:314068430611415041>',
    developer: '<:verifiedbotdev:853277205264859156>',
    partner: '<:DiscordPartner:843189287552942142>',
    earlySupporter: '<:supporter:585763690868113455>',
    verifiedBot: '<:verifiedbot1:986381257095143454><:verifiedbot2:986381298136395836>',
    cerifiedMod: '<:certified_mod:970980243131224075>',
    boost: '<:boosting:970653903400103977>',
    discordStaff: '<:DiscordStaff:843179936771604503>',
    bugHunter1: '<:bughunter:585765206769139723>',
    bugHunter2: '<:goldbughunter:853274684337946648>',
    hypesquad: '<:hypesquad_events:585765895939424258>',
    server_owner: '<:server_owner:970653903676899398>',
    activeDeveloper: '<:active_developer:1043712541018292304>',
  },
  colors: {
    black: '<:black:855497337333088266>',
    gray: '<:gray:855497920273842216>',
    white: '<:white:855497425291313252>',
    brown: '<:brown:855497147365326898>',
    lightred: '<:lightred:855497682436751431>',
    red: '<:red:855498266979074118>',
    darkred: '<:darkred:855496875284496414>',
    orange: '<:orange:855497591869669428>',
    yellow: '<:yellow:855497379322920964>',
    lightgreen: '<:lightgreen:855497772341002301>',
    green: '<:green:855497854230724609>',
    darkgreen: '<:darkgreen:855497012388298813>',
    cyan: '<:cyan:855497108073086997>',
    lightblue: '<:lightblue:855497811496140832>',
    blue: '<:blue:855497296644145152>',
    darkblue: '<:darkblue:855497057787838534>',
    blurple: '<:blurple:855497225827123200>',
    lightpurple: '<:lightpurple:855497728430440458>',
    purple: '<:purple:855498310386188288>',
    darkpurple: '<:darkpurple:855496838173818930>',
    pink: '<:pink:855497471727763486>',
  },
  emotiguy: {
    sad: '<:sad:717683548487811111>',
    angry_hands: '<:angry_messed_up_hands:729408548118855762>',
    angry_pink: '<:angry_pink:753969564408086600>',
    sad3: '<:sad3:729374854104612934>',
    coolwoah: '<:coolwoah:717684437508161546>',
    goodmeal: '<:good_meal:768948885162295326>',
  },
  progress: {
    fill: '<:progressfill:971334221450862642>',
    empty: '<:progressempty:1050093579525173338>',
    emptystart: '<:progressemptystart:971334221538951218>',
    emptyend: '<:progressemptyend:971334221425700894>',
    fillstart: '<:progressfillstart:971334221782196234>',
    fillend: '<:progressfillend:971334221006258187>',
    fillcut: '<:progressfillcut:971334221455036456>',
    fillstartcut: '<:progressfillstartcut:971347568409841664>',
  },
};

export default emojis;

export function icon(
  accentColor: number,
  icon: keyof typeof emojis['red'],
  type: 'emoji' | 'image' = 'emoji'
) {
  const [accentH, accentS, accentL] = chroma(accentColor).hsl();

  const color = Object.entries(colors.accents)
    .map(([name, [hue, sat, lum]]) => ({
      name,
      hue,
      sat,
      lum,
    }))
    .reduce((a, b) => {
      let aScore = a.hue + accentH;
      let bScore = b.hue + accentH;
      // if (accentL > 0.5) {
      //   aScore -= a.lum + accentL;
      // }
      // if (accentL > 0.5) {
      //   bScore -= b.lum + accentL;
      // }
      // if (accentS > 0.5) {
      //   aScore -= a.sat + accentS;
      // }
      // if (accentS > 0.5) {
      //   bScore -= b.sat + accentS;
      // }

      return Math.abs(bScore - 0) < Math.abs(aScore - 0) ? b : a;
    }).name;

  const emoji = emojis[color]?.[icon];

  if (type === 'emoji') {
    return emoji;
  }
  if (type === 'image') {
    const { id } = getEmojiObject(emoji);
    return formatEmojiURL(id);
  }
}
