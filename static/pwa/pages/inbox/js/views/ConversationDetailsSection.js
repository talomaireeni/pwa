/**
 * This file is responsible for rendering the conversation details section.
 * Similar to the FiltersSection in "FiltersSection.js" andConversationsListSection in "ConversationsListSection.js", this section will have its own class and methods.
 * The class ConversationsDetailsSection will have a method render() that will return the jQuery object for the section.
 * The render() method will be called by the InboxPage class to render the section.
 * The view consists of three parts (each rendered by a separate method):
 * 1. The header with the conversation title assignment details and action buttons.
 * 2. The conversation messages.
 * 3. The message input box.
 */
import InboxRichEditor from "./InboxEditor.js";

export default class ConversationDetailsSection {
    constructor(conversation, inboxApp) {
        this.conversation = conversation;
        this.inboxApp = inboxApp;
        this.days = this.inboxApp.days;
    }

    render() {
        const header = $(/*html*/`
                <div class="conversation-details" style="height: 100vh;"></div>`)
            .append(this.renderHeader())
            .append(this.renderMessages())
            .append(this.renderMessageInput());

        // add tooltip to the action buttons, make placement is bottom
        header.find('.action-button').tooltip({
            placement: 'bottom'
        });

        return header;
    }

    renderHeader() {
        return $(/*html*/`
            <header class="conversation-details-header">
                <div class="conversation-summary">
                    <img class="contact-picture" src="${this.conversation.contactPicture}" alt="Contact Picture">
                    <h5 class="conversation-title">${this.conversation.title}</h5>
                </div>
                <div class="conversation-actions">
                    <div class="action-buttons">
                        <a href="#" class="action-button iconoir-user-circle" title="Assign"></a>
                        <a href="#" class="action-button iconoir-app-notification" title="Make unread"></a>
                        <a href="#" class="action-button iconoir-alarm" title="Remind"></a>
                        <span style="color: #b2b2b2; width: 15px;"> | </span>
                        <a href="#" class="action-button iconoir-chat-bubble-check" title="Mark as done" style="color: var(--bs-teal)"></a>
                    </div>                  
                </div>
            </header>
            `);
    }


    /**
     * This method will render the conversation messages.
     * There are two types of messages: incoming and outgoing.
     * Incoming messages will be displayed on the left side of the screen with the contact's picture.
     * Outgoing messages will be displayed on the right side of the screen with the agent's picture.
     * The messages will be displayed in a scrollable container.
     */
    renderMessages() {
        return $('<div class="conversation-messages"></div>')
            .append(this.conversation.messages.map(message => this.renderMessage(message)));
    }

    /**
     * This method will render a single message.
     * @param {*} message
     * @returns {jQuery} The jQuery object for the message.
     */
    renderMessage(message) {
        // check if the message before the current message is from the same author and within 5 minutes
        const previousMessage = this.conversation.messages[this.conversation.messages.indexOf(message) - 1];
        const showInfo = !previousMessage || previousMessage.author_by !== message.author_by || message.timestamp - previousMessage.timestamp > 300000;

        const messageClass = message.author_by === 'Customer' ? 'incoming' : 'outgoing';

        // detect message text direction from the content. If it contains Arabic characters, add the class "rtl" to the message.
        const isRTL = /[\u0600-\u06FF]/.test(message.content);
        const senderAvatar = message.author_by == "Chatbot" ? `<i class="iconoir-sparks-solid"></i>` : `<img src="${this.conversation.contactPicture}" />`;

        return $(/*html*/`
            <div id="${message.message_id}" class="message ${!showInfo ? 'continuous-message' : ''} ${messageClass}">
                <div class="message-info" style="${!showInfo ? 'display: none;' : ''}">
                    <span class="message-author-picture">${senderAvatar}</span>
                    <span class="message-author">${message.author_name || message.author_by}</span>
                    <span class="message-circle"></span>
                    <span class="message-timestamp" data-timestamp="${message.timestamp}">${this.days(message.timestamp).fromNow()}</span>
                </div>
                <div class="message-content">
                    <p class="${isRTL ? 'rtl' : ''}">${message.content}</p>
                </div>
            </div>`);
    }

    renderMessageInput() {
        return $('<div class="inbox-input-editor"></div>')
            .append(this.renderMessageInputBox())
            // .append(this.renderActionsButtons());
    }

    renderMessageInputBox() {
        // return $('<textarea class="inbox-editor-textarea" placeholder="Type a message..."></textarea>');
        return new InboxRichEditor(1, '.inbox-input-editor',null,true,1,1000,'Type a message...').render();
    }

    renderActionsButtons() {
        return $(/*html*/`
            <div class="inbox-editor-action-buttons">
                <div class="main-actions">
                    <button id="send-button" class="btn btn-primary">Send</button>
                </div>
                <div class="secondary-actions">
                    <button class="btn btn-secondary"><i class="iconoir-attachment"></i></button>
                    <button class="btn btn-secondary"><i class="iconoir-emoji"></i></button>
                </div>
            </div>`);
    }
}