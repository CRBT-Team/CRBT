const { colors } = require("../../index");

module.exports.variables = {

//user settings
    color: `${colors.lightred.toLowerCase()}`,
    language: "enUS",

//work related stuff
    job_type: "unemployed", 
    job_xp: 0, 
    job_req: 800, 
    job_level: 1, 
    job_propositions: "",

//user related misc data
    blocklisted: false,
    lastCmd: "", //export last used cmd
//  avatarLog: "", //the logs for the avatar, will probably change the method if it gets too messy
    city: "", //last city entered in ()weather
    hourly_streak: 0,
    helpSuggestions: "",
    todolist: "", //for now we're using the old to-do lists since we ain't got time

//economy
    user_bank: 0, 
//  user_guild_bank: 0,

//inventory
    invbanner: "", 
    invmisc: "", 
    invbadge: "",

//profiles
    profile_name: "<user.name>",
    profile_about: "none",
    profile_banner: "",
    profile_badges: "",
    profilePronouns: "unspecified",
//  profile_rep: "", //legacy stuff from v8
//  profileLayout: "basic",

}