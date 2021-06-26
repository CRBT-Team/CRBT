const { emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "embeds",
    code: `
$reply[$messageID;
$if[$hasPerms[$authorID;admin]==false]
$get[title-$getGlobalUserVar[language]]
$get[description1-$getGlobalUserVar[language]]
$else
$get[title-$getGlobalUserVar[language]]
$get[description2-$getGlobalUserVar[language]]
$get[tutorial-$getGlobalUserVar[language]]
$get[description3-$getGlobalUserVar[language]]
$endif
;no]

$let[title-enUS;> ❌ **$username[$clientID] needs the "Embed Links" permission.**]
$let[description1-enUS;> Try to contact a server manager to solve this issue.]
$let[description2-enUS;> To fix this, go to Server Settings > Roles > CRBT > Perrmissions > Embed Links ${emojis.general.toggleon}]
$let[tutorial-enUS;> **Image tutorial:** 
> https://cdn.clembs.xyz/ho49it1.png 
> https://cdn.clembs.xyz/grmzEy3.png 
> https://cdn.clembs.xyz/CuWoykW.png]
$let[description3-enUS;> If you need further help, please go to the Discord support server: ${links.info.discord}.]

$let[title-enUK;> ❌ **$username[$clientID] needs the "Embed Links" permission.**]
$let[description1-enUK;> Try contacting an administrator to resolve the issue.]
$let[description2-enUK;> To fix this issue, go to Server Settings > Roles > CRBT > Permissions > Embed Links ${emojis.general.toggleon}]
$let[tutorial-enUK;> **Image tutorial:** 
> https://cdn.clembs.xyz/ho49it1.png 
> https://cdn.clembs.xyz/grmzEy3.png 
> https://cdn.clembs.xyz/CuWoykW.png]
$let[description3-enUK;> If you need further help, please go to the Discord Support server: ${links.info.discord}.]

$let[title-esES;> ❌ **$username[$clientID] necesita el permiso "Insertar enlaces".**]
$let[description1-esES;> Prueba a contactar a un administrador para solucionar este problema.]
$let[description2-esES;> Para arreglar esto, ve a Ajustes del servidor > Roles > CRBT > Permisos > Insertar enlaces ${emojis.general.toggleon}]
$let[tutorial-esES;> **Tutorial de imágenes:** 
> https://cdn.clembs.xyz/QL8rTZw.png 
> https://cdn.clembs.xyz/Q7CKnMk.png 
> https://cdn.clembs.xyz/r6uQks3.png]
$let[description3-esES;> Si necesitas más ayuda, ve al servidor de soporte de Discord: ${links.info.discord}.]

$let[title-frFR;> ❌ **$username[$clientID] a besoin de la permission "Intégrer les liens".**]
$let[description1-frFR;> Contactez un administrateur pour régler ce souci.]
$let[description2-frFR;> Pour régler cela, allez dans Paramètres du serveur > Roles > CRBT > Permissions > Intégrer des liens ${emojis.general.toggleon}]
$let[tutorial-frFR;> **Tutoriel en images :** 
> https://cdn.clembs.xyz/28b9nd8.png 
> https://cdn.clembs.xyz/cmcBtE1.png 
> https://cdn.clembs.xyz/leuTbTM.png]
$let[description3-frFR;> Si vous avez besoin d'aide, rejoignez le serveur Discord : ${links.info.discord}.]

$let[title-ptBR;> ❌ **$username[$clientID] needs the "Embed Links" permission.**]
$let[description1-ptBR;> Try contacting an administrator to resolve the issue.]
$let[description2-ptBR;> To fix this issue, go to Server Settings > Roles > CRBT > Permissions > Embed Links ${emojis.general.toggleon}]
$let[tutorial-ptBR;> **Image tutorial:** 
> https://cdn.clembs.xyz/ho49it1.png 
> https://cdn.clembs.xyz/grmzEy3.png 
> https://cdn.clembs.xyz/CuWoykW.png]
$let[description3-ptBR;> If you need further help, please go to the Discord Support server: ${links.info.discord}.]

$let[title-ru;> ❌ **$username[$clientID] нужны права на встраивание ссылок.**]
$let[description1-ru;> Свяжитесь с администратором сервера и сообщите ему о проблеме.]
$let[description2-ru;> Чтобы решить данную проблему, нужно зайти в "Настройки сервера" > "Роли" > "CRBT" > "Права текстового канала" > "Встраивать ссылки" ${emojis.general.toggleon}]
$let[tutorial-ru;> **Туториал в картинках:** 
> https://cdn.clembs.xyz/8kmO2s0.png 
> https://cdn.clembs.xyz/22cpDDP.png 
> https://cdn.clembs.xyz/XmOVzxA.png]
$let[description3-ru;> Если вам нужна дополнительная помощь, пожалуйста, перейдите на сервер поддержки Discord ${links.info.discord}.]
  `}