module.exports.command = {
    name: "test",
    code: `
$title[$getObjectProperty[title]]
$description[$getObjectProperty[description]]
$footer[$getObjectProperty[footer]]
$color[$getObjectProperty[color]]
$image[$getObjectProperty[image]]
$thumbnail[$getObjectProperty[thumbnail]]

$createObject[$replaceText[{$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$message;";“];
;"];title: ;, "title": "];description: ;, "description": "]";color: ;, "color": "];footer: ;, "footer": "];image: ;, "image": "];thumbnail: ;, "thumbnail": "]
};{", ;{]]
    `}