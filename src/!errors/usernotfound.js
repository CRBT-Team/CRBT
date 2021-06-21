const { emojis, colors } = require("../../index");

module.exports.awaitedCommand = {
    name: "usernotfound",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:
$if[$guildID!=]
$get[description1-$getGlobalUserVar[language]] 
$else
$get[description2-$getGlobalUserVar[language]]
$endif
}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Couldn't find this user.]
$let[description1-enUS;I couldn't find \`$message\`. Try again by using their tag (user#0000), their ID or by pinging them.]
$let[description2-enUS;They either don't exist or you will need to use their ID or tag (user#0000).]

$let[title-enUK;${emojis.general.error} Sorry! We couldn't find this user.]
$let[description1-enUK;Please try again by using their tag (Username#1234), their ID or by pinging them.]
$let[description2-enUK;This user either does not exist or you need to use their ID or tag (Username#1234).]

$let[title-frFR;${emojis.general.error} L'utilisateur est introuvable.]
$let[description1-frFR;Je n'ai pas trouvé \`$message\`. Essayez en utilisant son tag (utilisateur#0000), son identifiant ou en le/la mentionnant.]
$let[description2-frFR;Iel n'existe pas, ou vous devez utiliser son identifiant ou tag (utilisateur#0000).]

$let[title-esES;${emojis.general.error} No se ha podido encontrar este usuario.]
$let[description1-esES;Por favor, reintenta utilizando su tag (Username#1234), su ID o mencionándolos.]
$let[description2-esES;Este usuario o no existe o necesitas usar su ID de usuario o tag (Username#1234)]

$let[title-ptBR;${emojis.general.error} Hmm, não foi possível encontrar este usuário.]
$let[description1-ptBR;O argumento \`$message\`. parece ser inválido. Tente novamente usando a tag (Exemplo: user#0000), o ID ou mencionando o usuário.]
$let[description2-ptBR;Este usuário não existe, ou você precisa usar o ID ou tag (user#0000) dele.]

$let[title-ru;${emojis.general.error} Невозможно найти данного пользователя.]
$let[description1-ru;Я не могу найти \`$message\`. Попробуйте ещё раз, используя тег (user#0000), ID или упоминание.]
$let[description2-ru;Данного пользователя не существует. Используйте ID пользователя или его тег (user#0000).]
    `}