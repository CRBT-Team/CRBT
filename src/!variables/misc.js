const colors = require("../../json/colors.json");

module.exports.variables = {    
    blocklisted: false, //whether the user is blocklisted or not
    prefix: "()", //needs to be changed back to "//"
    city: "", //last city entered in ()weather
    r34_query: "", //last query for ()rule34
    webhook_token: "", webhook_id: "", //channel var for every channel
    volume: 50, //default volume so we dont break our ears
    color: `${colors.crbt.devblue}`, //default border color
    last_cmd: "", //last command to get exported to awaited cmd
    avatarlog: "", //the logs for the avatar, will probably change the method if it gets too messy
    language: "enUS", //default language
    telemetry: "minimal", //two states: minimal or complete 
    active_reminders: "", //to be merged with todo list

    //mod related stuff
    muted_role: "", 
    strikelog: "", 
    strikes: 0,

    //to-do list items
    list_1: "",
    list_2: "",
    list_3: "",
    list_4: "",
    list_5: "",
    list_6: "",
    list_7: "",
    list_8: "",
    list_9: "",
    list_10: "",
}