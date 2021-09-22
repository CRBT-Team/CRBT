const errors = require('../data/misc/errorMessages')
const { colors, emojis } = require('..')
/**
 * 
 * @param {*} type The type of error. Set to "custom" for a custom error message. 
 * @param {*} embedDesc The description field of the custom error embed, also used as a place for the required permissions in the "perms" error type.
 * @param {*} embedTitle The title field of the custom error embed.
 * @param {*} embedFooter The footer field of the custom error embed.
 * @returns An error embed message, ephemeral if the message is coming from an interaction.
 */
function handleError(type, embedDesc, embedTitle, embedFooter) {
    let message;
    let title = embedTitle ?? 'An error occured';
    let footer = embedFooter ? { text: embedFooter } : null;
    let desc = embedDesc;
    if (type === 'custom') {
        message = {embeds: [{
            author: {
                name: title,
                icon_url: `https://cdn.discordapp.com/emojis/866037872519938069.png`
            },
            description: desc.replace('[PERMS]', embedDesc),
            footer: footer,
            color: colors.error
        }], ephemeral: true};
    }
    else {
        message = {embeds: [{
            author: {
                name: errors[type].title,
                icon_url: `https://cdn.discordapp.com/emojis/866037872519938069.png`
            },
            description: errors[type].desc,
            footer: errors[type].footer ?? null,
            color: colors.error
        }], ephemeral: true};
    }
    return message;
}

module.exports = { handleError }