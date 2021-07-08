const { colors } = require("../../index");

module.exports.variables = {    
    blocklisted: false,
    prefix: "//",
    city: "", //last city entered in ()weather
    r34Query: "", //last query for ()rule34
    webhook_token: "", webhook_id: "", //channel var for every channel
    volume: 50, //default volume so we dont break our ears
    color: `${colors.lightred.toLowerCase()}`,
    lastCmd: "", //last command to get exported to awaited cmd
    /*
    avatarLog: "", //the logs for the avatar, will probably change the method if it gets too messy
    */
    language: "enUS",
    telemetry: "minimal", //two states: minimal or complete 
    /*
    allowedChannels: "", the allowlist for channels
    */

    //mod related stuff
    muted_role: "none", //note that this one is not in camelCase for compatibility reasons 
    strikelog: "", 
   
    //snipe stuff
    snipeContent: "",
	snipeDetails: "",
}