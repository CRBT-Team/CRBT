module.exports.userUpdateCommand = {
  channel: "749619030742007828",
  code: `
<@!$authorID> changed their pfp

$if[$getGlobalUserVar[avatarlog]==]
$setGlobalUserVar[avatarlog;[$get[date]]($get[img]);$authorID]
$else
$setGlobalUserVar[avatarlog;$getGlobalUserVar[avatarlog], [$get[date]]($get[img]);$authorID]
$endif

$let[img;$jsonRequest[https://normal-api.ml/imgur?url=$replaceText[$authorAvatar;webp;png]&size=512;url]]
$let[date;$formatDate[$dateStamp;YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;MM]]==1];true;0$formatDate[$dateStamp;MM]];false;$formatDate[$dateStamp;MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;DD]]==1];true;0$formatDate[$dateStamp;DD]];false;$formatDate[$dateStamp;DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;HH]]==1];true;0$formatDate[$dateStamp;HH]];false;$formatDate[$dateStamp;HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$dateStamp;mm]]==1];true;0$formatDate[$dateStamp;mm]];false;$formatDate[$dateStamp;mm]]]

$onlyIf[$authorAvatar!=$replaceText[$oldUser[avatar];&size=4096;];<@!327690719085068289> error message xd]
  `}