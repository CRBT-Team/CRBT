'use strict';

const process = require('node:process');
const Action = require('./Action');
const AutocompleteInteraction = require('../../structures/AutocompleteInteraction');
const ButtonInteraction = require('../../structures/ButtonInteraction');
const CommandInteraction = require('../../structures/CommandInteraction');
const MessageContextMenuInteraction = require('../../structures/MessageContextMenuInteraction');
const ModalSubmitInteraction = require('../../structures/ModalSubmitInteraction');
const {
  ChannelSelectInteraction,
  MentionableSelectInteraction,
  RoleSelectInteraction,
  SelectMenuInteraction,
  UserSelectInteraction,
} = require('../../structures/SelectMenuInteraction');
const UserContextMenuInteraction = require('../../structures/UserContextMenuInteraction');
const {
  Events,
  InteractionTypes,
  MessageComponentTypes,
  ApplicationCommandTypes,
} = require('../../util/Constants');

let deprecationEmitted = false;

class InteractionCreateAction extends Action {
  handle(data) {
    const client = this.client;

    // Resolve and cache partial channels for Interaction#channel getter
    const channel = this.getChannel(data);

    // Do not emit this for interactions that cache messages that are non-text-based.
    let InteractionType;

    switch (data.type) {
      case InteractionTypes.APPLICATION_COMMAND:
        switch (data.data.type) {
          case ApplicationCommandTypes.CHAT_INPUT:
            InteractionType = CommandInteraction;
            break;
          case ApplicationCommandTypes.USER:
            InteractionType = UserContextMenuInteraction;
            break;
          case ApplicationCommandTypes.MESSAGE:
            if (channel && !channel.isText()) return;
            InteractionType = MessageContextMenuInteraction;
            break;
          default:
            client.emit(
              Events.DEBUG,
              `[INTERACTION] Received application command interaction with unknown type: ${data.data.type}`
            );
            return;
        }
        break;
      case InteractionTypes.MESSAGE_COMPONENT:
        if (channel && !channel.isText()) return;

        switch (data.data.component_type) {
          case MessageComponentTypes.BUTTON:
            InteractionType = ButtonInteraction;
            break;
          case MessageComponentTypes.STRING_SELECT:
            InteractionType = SelectMenuInteraction;
            break;
          case MessageComponentTypes.CHANNEL_SELECT:
            InteractionType = ChannelSelectInteraction;
            break;
          case MessageComponentTypes.MENTIONABLE_SELECT:
            InteractionType = MentionableSelectInteraction;
            break;
          case MessageComponentTypes.ROLE_SELECT:
            InteractionType = RoleSelectInteraction;
            break;
          case MessageComponentTypes.USER_SELECT:
            InteractionType = UserSelectInteraction;
            break;
          default:
            client.emit(
              Events.DEBUG,
              `[INTERACTION] Received component interaction with unknown type: ${data.data.component_type}`
            );
            return;
        }
        break;
      case InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE:
        InteractionType = AutocompleteInteraction;
        break;
      case InteractionTypes.MODAL_SUBMIT:
        InteractionType = ModalSubmitInteraction;
        break;
      default:
        client.emit(
          Events.DEBUG,
          `[INTERACTION] Received interaction with unknown type: ${data.type}`
        );
        return;
    }

    const interaction = new InteractionType(client, data);

    /**
     * Emitted when an interaction is created.
     *
     * @param {Interaction} interaction The interaction which was created
     * @event Client#interactionCreate
     */
    client.emit(Events.INTERACTION_CREATE, interaction);

    /**
     * Emitted when an interaction is created.
     *
     * @deprecated Use {@link Client#event:interactionCreate} instead
     * @param {Interaction} interaction The interaction which was created
     * @event Client#interaction
     */
    if (client.emit('interaction', interaction) && !deprecationEmitted) {
      deprecationEmitted = true;
      process.emitWarning(
        'The interaction event is deprecated. Use interactionCreate instead',
        'DeprecationWarning'
      );
    }
  }
}

module.exports = InteractionCreateAction;
