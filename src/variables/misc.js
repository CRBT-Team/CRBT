const { colors } = require("../../index");

module.exports.variables = {    
    blocklisted: false, //whether the user is blocklisted or not
    prefix: "()", //needs to be changed back to "//"
    city: "", //last city entered in ()weather
    r34Query: "", //last query for ()rule34
    webhook_token: "", webhook_id: "", //channel var for every channel
    volume: 50, //default volume so we dont break our ears
    color: `${colors.lightred}`, //default border color
    lastCmd: "", //last command to get exported to awaited cmd
    avatarLog: "", //the logs for the avatar, will probably change the method if it gets too messy
    language: "enUS", //default language
    telemetry: "minimal", //two states: minimal or complete 
    activeReminders: "", //to be merged with todo list
    allowedChannels: "", //the allowlist for channels

    //mod related stuff
    muted_role: "", //note that this one is the only one not in camelCase for compatibility reasons 
    strikelog: "", 
    strikes: 0,
}