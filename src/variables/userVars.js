const { colors } = require("../../index");

module.exports.variables = {

//user settings
    
    color: `${colors.lightred.toLowerCase()}`,
    language: "enUS",
    telemetry: "complete", //two states: minimal or complete 
//  paintedColor: "", //for name color
    

//user related misc data

    blocklisted: false,
    lastCmd: "", //export last used cmd
//  avatarLog: "", //the logs for the avatar, will probably change the method if it gets too messy
    city: "", //last city entered in ()weather
    r34Query: "", //last query for ()rule34
    hourly_streak: 0,
//  reminders: "",
    list1: "",list2: "",list3: "",
    list4: "",list5: "",list6: "",
    list7: "",list8: "",list9: "",
    list10: "",


//economy

    user_bank: 0, 
//  user_guild_bank: 0,


//inventory

    invbanner: "", 
    invmisc: "", 
    invbadge: "",


//work related stuff
    job_type: "unemployed", 
    job_xp: 0, 
    job_req: 800, 
    job_level: 1, 
    job_propositions: "",


//profiles

    profile_name: "<user.name>",
    profile_about: "none",
    profile_banner: "",
    profile_badges: "",
    profilePronouns: "unspecified",
//  profile_rep: "", //legacy stuff from v8
//  profileLayout: "basic", //11.0

}