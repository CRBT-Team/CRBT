module.exports.variables = {
    
//server settings
    prefix: "//",
    muted_role: "none",
//  volume: 50,
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
    locked: false,
//  music_channel: "",
    strikes: "", 
    strikelog: "",
    snipeContent: "",
	snipeDetails: "",
    lastAttach: "",

//modules
    module_autoPublish: false, //Auto-publish
    module_economy: true, //Economy & Profiles
    module_fun: true, //Fun
    module_info: true, //Info
    module_messageLogs: false, //Message logs
    module_modLogs: false, //Moderation logs
    module_moderation: true, //Moderation
//  module_music: true, //Music
//  module_nsfw: false, //NSFW
    module_tools: true, //Tools

//  can't be disabled
    module_general: true, //Misc (previously "Basic")
    module_settings: true, //Settings
    module_admin: true, //Admin
}