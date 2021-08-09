module.exports.variables = {
    
//server settings
    prefix: "//",
    muted_role: "none",
    volume: 50, //which is interprated as 100 on CRBT
//  allowedChannels: "", //the allowlist for channels
    messagelogs_channel: "none", 
    modlogs_channel: "none",
    autoPublishedChannels: "",
//  memberStatsChannel: "none",
//  memberLogsChannel: "none",
//  loggingLook: "fancy",
//  serverLogsChannel: "none", 

//server profiles    
//  guild_contributors: "", 
//  guild_contributed: 0, 
//  guild_trophies: "none", 
//  partnered_guild: false, 
//  guild_description: "none", 
//  guild_bank: 0,
//  guild_banner: "",

//server related misc data
    webhook_token: "", webhook_id: "",
//  locked: false,
    music_channel: "",
    strikes: "", 
    strikelog: "",
    snipeContent: "",
	snipeDetails: "",
    lastAttach: "",
//  skip_votes: 0,
//  skip_users: "",
//  stopped_playback: false,
//  newPopup: false,

//modules
//  module_autoreact: true, //Auto-react
    module_autoPublish: false, //Auto-publish
    module_economy: true, //Economy & Profiles
    module_fun: true, //Fun
    module_info: true, //Info
    module_messageLogs: false, //Message logs
    module_modLogs: false, //Moderation logs
    module_moderation: true, //Moderation
    module_music: true, //Music
    module_nsfw: false, //NSFW
    module_tools: true, //Tools
//  module_serverStores: true,
//  module_serverProfiles: true,
//  module_radios: true,
//  module_joinMessages: false,
//  module_leaveMessages: false,
//  module_statsChannel: false,
//  module_channelAllowlist: false,
//  module_customCommands: false,

//  can't be disabled
    module_basic: true, //Misc (previously "Basic")
    module_settings: true, //Settings
    module_partnerCmd: true, //Partner command
    module_admin: true, //Admin
}