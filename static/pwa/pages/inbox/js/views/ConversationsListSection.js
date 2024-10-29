import ConversationDetailsSection from './ConversationDetailsSection.js';
class ConversationsListSection {
    constructor(conversations, inboxApp) {
        this.conversations = conversations;
        this.inboxApp = inboxApp;
        this.fetchingInProgress = false;
        this.view = $(/*html*/`
                <!-- Conversations List Section -->
                <div class="conversations-list">
                    <div class="conversations-list-items"></div>
                </div>
        `);

        this.renderConversationsListHeader();

        const agnetsIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const contactsIds = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

        // convert the conversations list to a Map object
        this.conversations = new Map();
        conversations.forEach(conversation => {
            this.conversations.set(conversation.conversation_id, this.formatConversationObject(conversation));
        });

        this.conversations.forEach((conversation, id) => {
            this.view.find('.conversations-list-items').append(this.renderConversationItem(conversation));
        });

        // when the user scrolls to the bottom of the conversation messages, add "Getting more conversation.." message at the bottom of the conversation messages
        this.view.find('.conversations-list-items').on('scroll', () => {
            if (Math.ceil(this.view.find('.conversations-list-items').scrollTop() + this.view.find('.conversations-list-items').height()) >= this.view.find('.conversations-list-items')[0].scrollHeight) {
                this.getMoreConversations();
            }
        });
    }

    render() {
        return this.view;
    }

    renderConversationsListHeader = () => {
        this.conversationListHeader = $(/*html*/`
            <div class="conversations-list-header">
                <strong style="font-weight: 600;letter-spacing: -.25px;font-size: 22px;">Conversations</strong>
                <div class="conversations-list-header-actions">
                    <button class="btn settings"><i class="iconoir-more-horiz"></i></button>
                    <button class="btn create"><i class="iconoir-plus"></i></button>
                </div>
            </div>`);

        this.conversationListHeader.find('.create').on('click', () => {
            console.log('Create new conversation');
        });

        this.conversationListHeader.find('.settings').on('click', () => {
            console.log('Settings');
        });

        this.conversationStatusToggle = $(/*html*/`
                <div class="conversations-list-status-toggle">
                <button class="btn all active">All <span class="conversations-count">32</span></button>
                <button class="btn unread">Unread <span class="conversations-count">2</span></button>`);

        this.conversationStatusToggle.find('.all').on('click', () => {
            // add active class only to the clicked button
            this.conversationStatusToggle.find('.btn').removeClass('active');
            this.conversationStatusToggle.find('.all').addClass('active');
        });

        this.conversationStatusToggle.find('.unread').on('click', () => {
            // add active class only to the clicked button
            this.conversationStatusToggle.find('.btn').removeClass('active');
            this.conversationStatusToggle.find('.unread').addClass('active');
        });

        this.view.prepend(this.conversationListHeader, this.conversationStatusToggle);
    }

    /**
     * This method renders a single conversation item inside the conversations list.
     * It recives a conversation object and returns a jQuery view. The conversation object has the following structure:
     * {
     *    id: string,
     *    channelType: string,
     *    title: string,
     *    lastMessage: string,
     *    unreadMessages: number,
     *    lastMessageTimestamp: string,
     *    contactPicture: string,
     *    assignedTo: string
     * }
     * 
     * Example conversation object:
     {
        "id": "1",
        "channelType": "whatsapp",
        "title": "John Doe",
        "lastMessage": "Hello, I have an issue with my order. The tracking number is not working. I tried to track it on the website but it says ...",
        "unreadMessages": 31,
        "lastMessageTimestamp": "10:00 AM",
        "contactPicture": "https://randomuser.me/api/portraits/men/28.jpg",
        "assignedTo": "https://randomuser.me/api/portraits/women/2.jpg"
    }
     * 
     * 
     * @param {Object} conversation
     * @returns {jQuery} view
     *
     */

    renderConversationItem = (conversation) => {
        let view = $(/*html*/`
        <div class="conversation-item">
            <div class="contact-picture">
                <img src="${conversation.contactPicture}">
                <span class="channel-type ${this.parseChannelType(conversation.channelType)}-channel">${this.getChannelIcon(this.parseChannelType(conversation.channelType))}</span>
                <span class="contact-status ${conversation.contactAvailability}"></span>
            </div>
            <div class="conversation-info">
                <div class="conversation-title">
                    <span class="contact-title">${conversation.title}</span>
                    <span class="unread-messages" style="${conversation.unreadMessages > 0 ? '' : 'display:none;'}">${conversation.unreadMessages}</span>
                </div>
                <div class="conversation-last-message">
                    <span class="last-message ${/[\u0600-\u06FF]/.test(conversation.lastMessage) ? 'rtl' : ''}">${conversation.lastMessage}</span>
                </div>
                <div class="conversation-assigned-to">
                    <span>Assigned to <img src="${conversation.assignedTo.agentPhoto}" data-agent-name="${conversation.assignedTo.agentName}"/></span>
                    <span class="last-message-time" data-timestamp="${conversation.lastMessageTimestamp}">${this.inboxApp.days(conversation.lastMessageTimestamp).fromNow()}</span>
                </div>
            </div>                
        </div>
    `);

        // add tooltip to Assigned to agent name
        view.find('.conversation-assigned-to img').tooltip({
            title: view.find('.conversation-assigned-to img').data('agent-name'),
            placement: 'top',
            trigger: 'hover'
        });


        view.on('click', () => {
            this.inboxApp.conversationDetailsSection = new ConversationDetailsSection(conversation, this.inboxApp);
            // remove the existing conversation details section
            this.inboxApp.container.find('.conversation-details').remove();
            // remove the active class from all conversation items and add it to the clicked item
            this.inboxApp.container.find('.conversation-item').removeClass('active');
            view.addClass('active');

            // render the conversation details section
            this.inboxApp.container.find('.conversations-list').after(this.inboxApp.conversationDetailsSection.render());

            // scroll to the bottom of the conversation details section with animation effect
            this.inboxApp.container.find('.conversation-messages').animate({
                scrollTop: this.inboxApp.container.find('.conversation-messages')[0].scrollHeight - this.inboxApp.container.find('.conversation-messages').height() + 100 // add 100px to the scroll height
            }, 200);

            // update the relative times
            this.inboxApp.updateRelativeTimes();
        });

        return view;
    }

    /**
     * 
     * This method gets more conversation messages from the server and appends them to the conversation messages list.
     * The method works as follows:
     * 1. When the user scrolls to the bottom of the conversation messages, the method will be called.
     * 2. The method will remove the "Getting more conversation.." message from the conversation messages list.
     * 3. The method will add "Getting more conversation.." message at the bottom of the conversation messages list.
     * The method will increase the page number by 1.
     * 5. The method will call the getAllConversations() method to get more conversation messages.
     * 6. The method will append the new conversation messages to the conversation messages list.
     * 
     */

    getMoreConversations = () => {
        if (this.fetchingInProgress) {
            return;
        }

        // 2. The method will remove the "Getting more conversation.." message from the conversation messages list.
        this.view.find('.conversations-list-items').find('.getting-more-conversation').remove();

        // 3. The method will add "Getting more conversation.." message at the bottom of the conversation messages list with bootstrap spinner.
        this.view.find('.conversations-list-items').append($(/*html*/`
            <div class="getting-more-conversation">
                <span class="getting-more-conversation-text">
                    Getting more conversation..
                    <span class="spinner-grow spinner-grow-sm" role="status" style="animation: 2s linear infinite spinner-grow"></span>
                </span>
            </div>
        `));

        // 4. The method will increase the page number by 1.
        this.inboxApp.updateFilters({ page: parseInt((this.inboxApp.filters.page || 1)) + 1 });

        this.fetchingInProgress = true;

        // 5. The method will call the getAllConversations() method to get more conversation messages.
        this.inboxApp.getAllConversations(this.inboxApp.filters).then((response) => {
            if (response.length === 0) {
                this.fetchingInProgress = false;
                // decrease the page number by 1.
                this.inboxApp.updateFilters({ page: (parseInt(this.inboxApp.filters.page || 1)) - 1 });

                // show Bootstrap Toast with message "No more conversation messages" placed at the bottom left of the screen
                this.inboxApp.showToast('No more conversation messages', 'primary', 'bottom-left');
            }

            // 6. The method will append the new conversation messages to the conversation messages list.
            const newConversation = response.map(conversation => {
                this.conversations.set(conversation.conversation_id, this.formatConversationObject(conversation));
            });

            // TODO: render the new conversation messages

            // scroll to the bottom of the conversation messages list minus 100px to prevent infinite updates
            this.view.find('.conversations-list-items').scrollTop(this.view.find('.conversations-list-items')[0].scrollHeight - this.view.find('.conversations-list-items').height() - 100);
            // TODO: remove the above lines since appending the new conversation messages will have the same effect

            // remove the "Getting more conversation.." message from the conversation messages list.
            this.view.find('.conversations-list-items').find('.getting-more-conversation').remove();

            this.fetchingInProgress = false;
        });
    }

    formatConversationObject = (conversation) => {
        return {
            id: conversation.conversation_id,
            channelType: conversation.channel_type,
            title: conversation.customer_name,
            lastMessage: this.formatLastMessage(conversation),
            unreadMessages: conversation.unread_messages,
            lastMessageTimestamp: conversation.conversation_last_interaction,
            contactPicture: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * (9 - 0 + 1) + 0)}.jpg`,
            assignedTo: {
                agentId: conversation.assigned_to_agent_id,
                agentName: this.inboxApp.agents.find(agent => agent.id == conversation.assigned_to_agent_id)?.name || conversation.assigned_to_agent_id || 'Unassigned',
                "agentPhoto": `https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * (9 - 0 + 1) + 0)}.jpg`
            },
            messages: conversation.conversation_messages,
        }
    }

    formatLastMessage = (conversation) => {
        const lastMessageIndex = conversation.conversation_messages.length - 1;
        let lastMessageContent = '';

        // loop from the last message to the first message and stop at the first message that is not empty
        for (let i = lastMessageIndex; i >= 0; i--) {
            const message = conversation.conversation_messages[i];

            // check for last message type
            switch (message.message_type) {
                case 'text':
                case 'button_reply':
                case 'button':
                case 'take_input':
                case 'list':
                case 'list_reply':
                case 'whatsapp-template':
                    lastMessageContent = message.content;
                    break;

                case 'buttons':
                case 'document':
                case 'image':
                case 'video':
                case 'voice':
                case 'location':
                    lastMessageContent = message.content.body;
                    break;

                default:
                    lastMessageContent = '';
            }

            // if the last message is not empty, stop
            if (lastMessageContent?.length > 0) {
                break;
            }
        }

        return lastMessageContent;
    }

    parseChannelType = (channelType) => {
        const normalizedChannelType = channelType.toLowerCase();
        let parsedChannelType = '';

        if (normalizedChannelType.includes('whatsapp')) {
            parsedChannelType = 'whatsapp';
        }
        else if (normalizedChannelType.includes('facebook')) {
            parsedChannelType = 'facebook';
        }
        else if (normalizedChannelType.includes('instagram')) {
            parsedChannelType = 'instagram';
        }
        else if (normalizedChannelType.includes('google')) {
            parsedChannelType = 'google-maps';
        }
        else if (normalizedChannelType.includes('messenger')) {
            parsedChannelType = 'messenger';
        }
        else if (normalizedChannelType.includes('x')) {
            parsedChannelType = 'x';
        }
        else {
            parsedChannelType = '';
        }

        return parsedChannelType;
    }

    getChannelIcon = (channelType) => {
        const channelIcons = {
            "whatsapp": `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
        <path d="M19.1,4.9C17.2,3,14.7,2,12,2C6.5,2,2,6.5,2,12c0,1.8,0.5,3.5,1.3,5L2,22l5.2-1.2C8.7,21.6,10.3,22,12,22	c5.5,0,10-4.5,10-10C22,9.3,21,6.8,19.1,4.9z M16.9,15.6c-0.2,0.6-1.2,1.1-1.7,1.2c-0.5,0-0.9,0.2-3-0.6c-2.5-1-4.1-3.6-4.3-3.8	c-0.1-0.2-1-1.4-1-2.6S7.5,8,7.8,7.7C8,7.4,8.3,7.4,8.5,7.4s0.3,0,0.5,0s0.4,0,0.6,0.4c0.2,0.5,0.7,1.7,0.8,1.9	c0.1,0.2,0.1,0.3,0,0.4c-0.1,0.1-0.1,0.3-0.2,0.4c-0.1,0.1-0.3,0.3-0.4,0.4c-0.1,0.1-0.3,0.3-0.1,0.5c0.1,0.3,0.6,1.1,1.4,1.7	c1,0.9,1.8,1.1,2,1.2c0.3,0.1,0.4,0.1,0.5-0.1c0.1-0.2,0.6-0.7,0.8-1c0.2-0.3,0.3-0.2,0.6-0.1c0.3,0.1,1.5,0.7,1.7,0.8	c0.3,0.1,0.4,0.2,0.5,0.3C17.1,14.5,17.1,15,16.9,15.6z"></path>
        </svg>`,
            "x": `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
        <path d="M 2.3671875 3 L 9.4628906 13.140625 L 2.7402344 21 L 5.3808594 21 L 10.644531 14.830078 L 14.960938 21 L 21.871094 21 L 14.449219 10.375 L 20.740234 3 L 18.140625 3 L 13.271484 8.6875 L 9.2988281 3 L 2.3671875 3 z M 6.2070312 5 L 8.2558594 5 L 18.033203 19 L 16.001953 19 L 6.2070312 5 z"></path>
        </svg>`,
            "instagram": `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
            <path d="M 8 3 C 5.239 3 3 5.239 3 8 L 3 16 C 3 18.761 5.239 21 8 21 L 16 21 C 18.761 21 21 18.761 21 16 L 21 8 C 21 5.239 18.761 3 16 3 L 8 3 z M 18 5 C 18.552 5 19 5.448 19 6 C 19 6.552 18.552 7 18 7 C 17.448 7 17 6.552 17 6 C 17 5.448 17.448 5 18 5 z M 12 7 C 14.761 7 17 9.239 17 12 C 17 14.761 14.761 17 12 17 C 9.239 17 7 14.761 7 12 C 7 9.239 9.239 7 12 7 z M 12 9 A 3 3 0 0 0 9 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 12 A 3 3 0 0 0 12 9 z"></path>
        </svg>`,
            "facebook": `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
            <path d="M19,3H5C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h7.621v-6.961h-2.343v-2.725h2.343V9.309 c0-2.324,1.421-3.591,3.495-3.591c0.699-0.002,1.397,0.034,2.092,0.105v2.43h-1.428c-1.13,0-1.35,0.534-1.35,1.322v1.735h2.7 l-0.351,2.725h-2.365V21H19c1.105,0,2-0.895,2-2V5C21,3.895,20.105,3,19,3z"></path>
        </svg>`,
            "messanger": `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
            <path d="M12,2C6.486,2,2,6.262,2,11.5c0,2.545,1.088,4.988,3,6.772v4.346l4.08-2.039C10.039,20.858,11.02,21,12,21 c5.514,0,10-4.262,10-9.5S17.514,2,12,2z M13.167,14.417l-2.917-2.333L5,14.417l5.833-5.833l2.917,2.333L19,8.583L13.167,14.417z"></path>
        </svg>`,
            "linkedin": `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
            <path d="M12,2C6.486,2,2,6.262,2,11.5c0,2.545,1.088,4.988,3,6.772v4.346l4.08-2.039C10.039,20.858,11.02,21,12,21 c5.514,0,10-4.262,10-9.5S17.514,2,12,2z M13.167,14.417l-2.917-2.333L5,14.417l5.833-5.833l2.917,2.333L19,8.583L13.167,14.417z"></path>
        </svg>`,
            "google-maps": `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
            <path d="M 18 1 C 16.373466 1 14.941036 1.793645 14.027344 3 L 5 3 C 3.895 3 3 3.895 3 5 L 3 19 C 3 19.178 3.0312188 19.346719 3.0742188 19.511719 L 13.650391 8.9355469 C 13.921917 9.5969385 14.236041 10.22471 14.542969 10.810547 C 14.550361 10.824662 14.55512 10.837469 14.5625 10.851562 L 13.414062 12 L 20.925781 19.511719 C 20.968781 19.346719 21 19.178 21 19 L 21 11.660156 C 21.158385 11.323154 21.328472 10.980602 21.509766 10.626953 C 22.208766 9.2619531 23 7.714 23 6 C 23 3.243 20.757 1 18 1 z M 17.972656 3.0292969 C 19.629656 3.0292969 20.972656 4.3722969 20.972656 6.0292969 C 20.971656 8.5252969 18.376953 11.030062 18.376953 13.664062 C 18.376953 13.870062 18.176703 14.023437 17.970703 14.023438 C 17.764703 14.023438 17.595703 13.840766 17.595703 13.634766 C 17.595703 11.000766 14.972656 8.7552969 14.972656 6.0292969 C 14.972656 4.3722969 16.315656 3.0292969 17.972656 3.0292969 z M 8.0019531 5 C 8.7799531 5 9.4874844 5.29525 10.021484 5.78125 L 9.1777344 6.6269531 C 8.8607344 6.3559531 8.4509531 6.1894531 8.0019531 6.1894531 C 7.0019531 6.1894531 6.1914063 7 6.1914062 8 C 6.1914062 8.999 7.0019531 9.8105469 8.0019531 9.8105469 C 8.8409531 9.8105469 9.4217656 9.3121875 9.6347656 8.6171875 L 8.0019531 8.6171875 L 8.0019531 7.4726562 L 10.828125 7.4765625 C 11.074125 8.6455625 10.519953 11 8.0019531 11 C 6.3439531 11 5 9.657 5 8 C 5 6.343 6.3439531 5 8.0019531 5 z M 18 5 A 1 1 0 0 0 17 6 A 1 1 0 0 0 18 7 A 1 1 0 0 0 19 6 A 1 1 0 0 0 18 5 z M 12 13.414062 L 4.4882812 20.925781 C 4.6532812 20.968781 4.822 21 5 21 L 19 21 C 19.178 21 19.346719 20.968781 19.511719 20.925781 L 12 13.414062 z"></path>
        </svg>`
        };

        return channelIcons[channelType];
    }

}

export default ConversationsListSection;