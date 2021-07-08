module.exports.command = {
    name: "editcode",
    aliases: ["edit", "editcmdcode", "editscript", "edit_code", "edit-code"],
    usage_enUS: "<command name/ID> <new script>",
    code: `
$if[$toLowercase[$message[1]]==$getServerVar[cmd1names]]
$setServerVar[cmd1code;$messageSlice[1]]

$reply[$messageID;
{field:Old:
\`\`\`
$getServerVar[cmd1code]\`\`\`
:yes}
{field:New:
\`\`\`
$messageSlice[1]\`\`\`
:yes}
;no]

$endif

$if[$checkContains[$message;description: ;title:; footer: ;image: ;thumbnail: ]==true]
$createObject[$replaceText[{$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$message;";\"];
;"];title: ;, "title": "]
;description: ;, "description": "]
;color: ;, "color": "]
;footer: ;, "footer": "]"
;image: ;, "image": "]
;thumbnail: ;, "thumbnail": "]
};{", ;{]]

$else

$endif
    `}