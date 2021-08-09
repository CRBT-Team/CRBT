const { colors } = require("../../index");

module.exports.variables = {

//user settings
    color: `${colors.lightred.toLowerCase()}`,
    language: "enUS",
//  telemetry: "complete", //two states: minimal or complete 
//  paintedColor: "", //for name color

//work related stuff
    job_type: "unemployed", 
    job_xp: 0, 
    job_req: 800, 
    job_level: 1, 
    job_propositions: "",

//experiments
    experimentalFeatures: false, //to enable experimental features
    
//experimentalFeatures flag
    r34Query: "", //last query for ()rule34
    todolist: "", //for now we're using the old to-do lists since we ain't got time

//user related misc data
    blocklisted: false,
    lastCmd: "", //export last used cmd
//  avatarLog: "", //the logs for the avatar, will probably change the method if it gets too messy
    city: "", //last city entered in ()weather
    hourly_streak: 0,
    helpSuggestions: "",

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