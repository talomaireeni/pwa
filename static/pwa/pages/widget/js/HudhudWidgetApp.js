import $ from './vendor/jquery.js';
import HudhudWidgetLocalization from './HudhudWidgetLocalization.js';
import Pusher from '../../../common/vendor/js/pusher/pusher.js';
import days from '../../../common/vendor/js/days/src/index.js';
import relativeTime from '../../../common/vendor/js/days/src/plugin/relativeTime/index.js';
import updateLocale from '../../../common/vendor/js/days/src/plugin/updateLocale/index.js';
import locale from '../../../common/vendor/js/days/src/locale/ar-sa.js';
import { generateUUID, storeUserData, getUserData, removeUserData } from './HudhudUtils.js';
class HudhudWidget {
    constructor(configs) {
        this.injectStyles(configs.primaryColor, configs.secondaryColor, configs.size);
        this.position = configs.position || 'right';
        this.localization = new HudhudWidgetLocalization(configs.supportedLanguages || ['ar', 'en'], configs.defaultLanguage || 'ar');
        this.direction = this.localization.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        this.widgetHeader = this.createWidgetHeader(configs.logoUrl, configs.titleText, configs.subtitleText);
        this.widgetEditor = this.createWidgetEditor();
        this.widgetWarningPopup = this.createWarningPopup();
        this.widgetReferencePopup = this.createReferencePopup();
        this.widgetWrapper = this.createWidgetWrapper(configs.footerText || '');
        this.widgetChatElements = this.widgetWrapper.find('#hudhud-widget-chat-elements');
        this.currentAgentName = configs.subtitleText || '';

        // socket variables
        this.socket_url = configs.socket_url;
        this.app_key = configs.app_key;
        this.channel_token = configs.channel_token;
        this.platform_session = configs.platform_session;
        this.flow_name = configs.flow_name;
        this.flow_status = configs.flow_status;

        // state variables
        this.sessionDuration = configs.sessionDuration || 30 * 60 * 1000; // 30 minutes
        this.conversationId = null;
        this.senderId = null;
        this.servingMode = configs?.serving_mode?.toUpperCase() || 'LIVE'; // LIVE, SIMULATION, PREVIEW
        this.conversationStatus = 'UNKNOWN';
        this.currentAgentName = configs.subtitleText;
        this.currentAgentImage = configs.logoUrl;
        this.triggerIsSent = false;
        this.lastMessageTimestamp = null;
        this.socket = null;
        this.setupConversation();



        // setup days.js
        days.extend(relativeTime);
        days.extend(updateLocale);
        if (this.localization.currentLanguage === 'ar') {
            days.locale(locale);
            days.updateLocale('ar-sa', {
                relativeTime: {
                    future: 'في %s',
                    past: 'منذ %s',
                    s: 'ثوان',
                    ss: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'ثانية';
                        }

                        if (number === 2) {
                            return 'ثانيتين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} ثوان`;
                        }

                        return `${number} ثانية`;
                    },
                    m: 'دقيقة',
                    mm: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'دقيقة';
                        }

                        if (number === 2) {
                            return 'دقيقتين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} دقائق`;
                        }

                        return `${number} دقيقة`;
                    },
                    h: 'ساعة',
                    hh: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'ساعة';
                        }

                        if (number === 2) {
                            return 'ساعتين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} ساعات`;
                        }

                        return `${number} ساعة`;
                    },
                    d: 'يوم',
                    dd: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'يوم';
                        }

                        if (number === 2) {
                            return 'يومين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} أيام`;
                        }

                        return `${number} يوم`;
                    },
                    M: 'شهر',
                    MM: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'شهر';
                        }

                        if (number === 2) {
                            return 'شهرين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} أشهر`;
                        }

                        return `${number} شهر`;
                    },
                    y: 'سنة',
                    yy: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'سنة';
                        }

                        if (number === 2) {
                            return 'سنتين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} سنوات`;
                        }

                        return `${number} سنة`;
                    },
                }
            });
        }

        setInterval(() => {
            this.widgetChatElements.find('.author-time').each((index, element) => {
                const messageTimestamp = $(element).closest('.hudhud-widget-chat-message').data('timestamp');
                $(element).text(days(messageTimestamp).fromNow());
            });
        }, 1 * 60 * 1000);
    }

    injectStyles(primaryColor, secondaryColor, size) {
        $('head').append(`<link rel="stylesheet" type="text/css" href="/static/pwa/common/vendor/css/iconoir.css">`);
        $('head').append(`<link rel="stylesheet" type="text/css" href="/static/pwa/pages/widget/css/hudhud-widget-styles.css">`);
        $('head').append(`
            <style id="hudhud-widget-style-variables">
            #hudhud-widget-wrapper {
                --hw-primary-color: ${primaryColor};
                --hw-primary-transparent-color: ${primaryColor}40;
                --hw-secondary-color: ${secondaryColor};
                --hw-secondary-transparent-color: ${secondaryColor}40;
                --hw-size: ${size};
            }
            </style>`);
    }

    setupConversation() {
        // checks if the current user has a senderId and conversationId (from storage) or not.
        if (getUserData('senderId') && getUserData('conversationId')) {
            this.senderId = getUserData('senderId');
            this.conversationId = getUserData('conversationId');
            this.conversationStatus = 'CONTINUING_CONVERSATION';
            this.triggerIsSent = true;
        }
        else {
            if (!getUserData('senderId')) {
                this.conversationStatus = 'FIRST_INTERACTION';
                this.senderId = generateUUID();
            }
            else {
                this.conversationStatus = 'NEW_CONVERSATION';
                this.senderId = getUserData('senderId');
            }

            // always generate a new conversationId since it's a new conversation
            this.conversationId = generateUUID();
            this.triggerIsSent = false;

            storeUserData('senderId', this.senderId);

            // storing the conversationId is done after the trigger is sent in the connectSocket function
        }

        // connect socket only if there is a CONTINUING_CONVERSATION or servine mode is simulation
        if (this.conversationStatus === 'CONTINUING_CONVERSATION' || this.servingMode === 'SIMULATION') {
            this.connectSocket();
        }
    }

    /**
     * Socket management functions:
     * 1. connectSocket: initialize the socket connection and bind the events
     * 2. bindSocketEvents: bind socket events (new_message, started_typing, stopped_typing, reassigned, read_message, closed_conversation)
     * 3. sendSocketEvent: send an event to the socket
     */

    connectSocket() {

        /**
         * This function is used to initialize the socket connection and bind the events
         */

        // ** from context **

        let extraHeaders = {
            'sender-id': this.senderId,
            'conversation-id': this.conversationId,
            'token': this.channel_token,
        };
        // ** socket handler if simulation **       
        if (this.servingMode === 'SIMULATION') {
            extraHeaders['platform-session'] = this.platform_session
            extraHeaders['flow'] = this.flow_name
            extraHeaders['flow-status'] = this.flow_status
        }

        const pusher = new Pusher(this.app_key, {
            cluster: 'us2',
            authEndpoint: this.socket_url + "/widget/authentication",
            auth: {
                headers: extraHeaders
            }
        });

        this.socket = pusher.subscribe('presence-widget-' + this.conversationId);

        this.socket.bind('pusher:subscription_succeeded', function () {

            // bind events
            this.bindSocketEvents();

            if (this.conversationStatus === 'CONTINUING_CONVERSATION') {
                this.sendSocketEvent('get_previous_conversations', null);
            }
            else {
                if (!this.triggerIsSent) {
                    this.triggerIsSent = this.sendSocketEvent('trigger-widget-opened', null);

                    if (this.triggerIsSent) {
                        if (this.servingMode === 'LIVE') {
                            storeUserData('conversationId', this.conversationId);
                        }
                    }
                }
            }
        }, this);
    }

    bindSocketEvents() {
        /**
         * This function is used to bind socket events (new_message, started_typing, stopped_typing, reassigned, read_message, closed_conversation)
         */

        const l = this.localization;

        // if the socket is not initialized, return
        if (!this.socket) {
            return;
        }

        // if the socket is already bound, return
        if (this.socket.isBound) {
            return;
        }

        // for handling chunked events
        this.chunkedEvents = {};
        const bindWithChunking = (event, callback) => {
            this.socket.bind(event, callback); // regular event

            this.socket.bind("chunked-" + event, data => {
                if (!this.chunkedEvents.hasOwnProperty(data.id)) {
                    this.chunkedEvents[data.id] = { chunks: [], receivedFinal: false };
                }
                var ev = this.chunkedEvents[data.id];
                ev.chunks[data.index] = data.chunk;
                if (data.final) ev.receivedFinal = true;
                if (ev.receivedFinal && ev.chunks.length === Object.keys(ev.chunks).length) {
                    const unChunkedData = JSON.parse(ev.chunks.join(""));
                    callback(unChunkedData);
                    delete this.chunkedEvents[data.id];
                }
            }, this);
        }

        // bind new_message event
        this.socket.bind('new_message', (msg) => {
            switch (msg.author_by) {
                case 'Chatbot':
                case 'Agent':
                    this.addChatElement({ type: 'agent-message', message: msg });
                    break;

                case 'Customer':
                    this.addChatElement({ type: 'user-message', message: msg });
            }
        }, this);

        // bind started_typing event
        this.socket.bind('started_typing', (conversation_id_typing) => {
            this.addChatElement({ type: 'typing-animation' });
        }, this);

        // bind stopped_typing event
        this.socket.bind('stopped_typing', (conversation_id_typing) => {
            this.removeAgentIsTypingAnimation();
        }, this);

        // bind reassigned event
        this.socket.bind('reassigned', (agentObject) => {
            console.log("reassigned", agentObject);
            this.addChatElement({ type: 'event-message', message: { text: l.t('agent_joined'), type: "info" } });
        }, this);

        // set_language event 
        this.socket.bind('set_language', (data) => {
            this.localization.switchToLanguage(data);
        });

        // bind closed_conversation event
        this.socket.bind('closed_conversation', (msg) => {
            console.log("closed_conversation", msg);
            this.addChatElement({ type: 'event-message', message: { text: l.t('conversation_is_closed'), type: "warning" } });
            this.closeConversation();
        }, this);

        // bind read_message event
        this.socket.bind('read_message', (msg) => {
            console.log("read_message", msg);
        }, this);

        bindWithChunking('previous_messages', (messages) => {
            this.renderFullConversation(messages);
        });

        bindWithChunking('message_details', (messageDetails) => {
            this.appendMessageMetadata(messageDetails);
        });

        this.socket.isBound = true;
    }

    sendSocketEvent(event, payload = null, type = null) {
        if (this.servingMode === 'PREVIEW') { return false; }

        if (this.socket.members.me) {
            let eventData = {
                info: this.socket.members.me.info,
                conversation_id: this.conversationId,
                content: payload,
                content_id: generateUUID()
            };

            if (type) {
                eventData.type = type;
            }

            return this.socket.trigger('client-' + event, eventData);
        }
        else {
            console.log("socket.members.me is null");
            return false;
        }
    }

    closeConversation() {
        // remove conversationId and lastMessageTimestamp from the storage
        removeUserData('conversationId');
        removeUserData('lastMessageTimestamp');

        this.conversationId = null;
        this.conversationStatus = 'UNKNOWN';
        this.lastMessageTimestamp = null;
    }

    renderWidget() {
        if ($('#hudhud-widget-wrapper').length) {
            return;
        }

        $('body').append(this.widgetWrapper);
    }

    createWidgetHeader(logoUrl, titleText, subtitleText) {
        const l = this.localization;
        const widgetHeader = $(/*html*/`
            <div id="hudhud-widget-header">
                <div id="hudhud-widget-header-logo">
                    <img class="hudhud-widget-logo" src="${logoUrl}"/>
                </div>
                <div id="hudhud-widget-header-title">
                    <h1>${titleText}</h1>
                    <h2>${subtitleText}</h2>
                </div>
                <div id="hudhud-widget-header-actions">
                    <button id="hudhud-widget-language-switch-button">
                        <i class="iconoir-language" title="${l.t('switch_language')}"></i>
                    </button>
                    <button id="hudhud-widget-close-button">
                        <i class="iconoir-xmark hudhud-widget-close-icon"></i>
                    </button>
                </div>
            </div>`);

        widgetHeader.find('#hudhud-widget-language-switch-button').on('click', () => {
            this.switchLanguage();
            this.sendSocketEvent('set_preferred_language', { "preferred_language": l.currentLanguage });
        });
        widgetHeader.find('#hudhud-widget-close-button').on('click', () => this.showWarningPopup());

        return widgetHeader;
    }

    createWidgetEditor() {
        const l = this.localization;
        const widgetEditor = $(/*html*/`
            <div id="hudhud-widget-editor">
                <div id="hudhud-widget-editor-input">
                    <textarea type="text" id="hudhud-widget-editor-textarea" placeholder="${l.t('editor_placeholder')}"></textarea>
                </div>
                <div id="hudhud-widget-editor-actions">
                    <div id="hudhud-widget-editor-attachment">
                        <button id="hudhud-widget-editor-attachment-file"><i class="iconoir-attachment"></i></button>
                        <button id="hudhud-widget-editor-attachment-emoji-button"><i class="iconoir-emoji"></i></button>
                        <button id="hudhud-widget-editor-attachment-voice"><i class="iconoir-microphone"></i></button>
                    </div>
                    <div id="hudhud-widget-editor-send">
                        <button id="hudhud-widget-editor-send-button">${l.t('send')} <i class="iconoir-send-solid hudhud-widget-reflectable-icon"></i></button>
                    </div>
                </div>
            </div>
        `);

        const sendMessage = (message) => {
            if (message.length) {
                const eventSent = this.sendSocketEvent('new_message', message, 'text');
                if (eventSent) {
                    this.widgetEditor.find('#hudhud-widget-editor-textarea').val('');
                }
            }
        };

        const bindEvents = () => {
            // bind click event
            widgetEditor.find('#hudhud-widget-editor-send-button').on('click', () => {
                const message = widgetEditor.find('#hudhud-widget-editor-textarea').val();
                sendMessage(message);
            });

            // bind enter key event to the send button
            widgetEditor.find('#hudhud-widget-editor-textarea').on('keypress', (e) => {
                if (e.which === 13) {
                    const message = widgetEditor.find('#hudhud-widget-editor-textarea').val();
                    sendMessage(message);
                }
            });
        };

        widgetEditor.disable = () => {
            widgetEditor.find('#hudhud-widget-editor-textarea').prop('disabled', true);
            widgetEditor.find('#hudhud-widget-editor-send-button').prop('disabled', true);
            widgetEditor.addClass('hudhud-widget-editor-disabled');

            // unbind events
            widgetEditor.find('#hudhud-widget-editor-send-button').off('click');
            widgetEditor.find('#hudhud-widget-editor-textarea').off('keypress');
            widgetEditor.addClass('hudhud-widget-disabled-editor');
        };

        widgetEditor.enable = () => {
            widgetEditor.find('#hudhud-widget-editor-textarea').prop('disabled', false);
            widgetEditor.find('#hudhud-widget-editor-send-button').prop('disabled', false);
            widgetEditor.removeClass('hudhud-widget-disabled-editor');

            // rebind events
            bindEvents();
        }

        // by default, disable the editor
        widgetEditor.disable();

        return widgetEditor;
    }

    createWarningPopup() {
        const l = this.localization;
        const widgetWarningPopup = $(/*html*/`
            <div id="hudhud-widget-warning-popup" class="hudhud-widget-warning-popup-${this.position}-position hudhud-widget-popup-hidden" style="display:none;">
                <div class="hudhud-widget-warning-popup-content">
                    <h2>${l.t('close_warning')}</h2>
                </div>
                <div class="hudhud-widget-warning-popup-actions">
                    <button id="hudhud-widget-warning-popup-confirm-button">${l.t('close_warning_confirm')}</button>
                    <button id="hudhud-widget-warning-popup-cancel-button">${l.t('close_warning_cancel')}</button>
                </div>
            </div>`);

        widgetWarningPopup.find('#hudhud-widget-warning-popup-confirm-button').on('click', () => {
            this.sendSocketEvent('closed_conversation', null);
            this.hideWarningPopup();
        });
        widgetWarningPopup.find('#hudhud-widget-warning-popup-cancel-button').on('click', () => this.hideWarningPopup());

        return widgetWarningPopup;
    }

    appendMessageMetadata(messageDetails) {
        const messageId = messageDetails.message_id;
        const metadataItem = messageDetails.content;
        const messageElement = this.widgetChatElements.find(`#${messageId}`);

        // get existing metadata items or create an empty array
        const elementMetadata = messageElement.data('metadata') || [];
        // add new metadata item
        elementMetadata.push(metadataItem);
        // remove duplicates (if any) and update the metadata
        messageElement.data('metadata', [...new Set(elementMetadata)]);
        this.showRefererencesButton(messageId);
    }

    showRefererencesButton(messageId) {
        // get message metadata
        const metadata = this.widgetChatElements.find(`#${messageId}`).data('metadata');
        // if there is no metadata, return
        if (!metadata) {
            return;
        }

        // find the references button and show it
        this.widgetChatElements.find(`#${messageId}`).find('.hudhud-widget-chat-message-reference-button').show();
    }

    createReferencePopup() {
        const l = this.localization;
        const widgetReferencePopup = $(/*html*/`
            <div id="hudhud-widget-reference-popup" class="hudhud-widget-reference-popup-${this.position}-position hudhud-widget-popup-hidden" style="display:none;">
                <div class="hudhud-widget-reference-popup-actions">
                    <button id="hudhud-widget-reference-popup-close-button">
                    ${l.t('close_references_button')}
                    <i class="iconoir-xmark-circle-solid hudhud-widget-close-icon"></i>
                    </button>
                </div>
                <div class="hudhud-widget-reference-popup-content">
                    <h1>${l.t('answer_references')}</h1>
                    <div class="hudhud-widget-reference-popup-content-list">
                    </div>
                </div>
            </div>`);

        widgetReferencePopup.find('#hudhud-widget-reference-popup-close-button').on('click', () => this.hideReferencePopup());

        return widgetReferencePopup;
    }

    showReferencePopup(messageId) {
        const l = this.localization;
        // get message references (metadata)
        const metadata = this.widgetChatElements.find(`#${messageId}`).data('metadata');
        // if there are no references, return
        if (metadata.length === 0) {
            return;
        }

        // populate the references popup with the references
        const referencesList = this.widgetWrapper.find('.hudhud-widget-reference-popup-content-list');
        metadata.forEach((reference, index) => {
            const referenceItem = $(/*html*/`
                <div id="${reference.id}" class="hudhud-widget-reference-popup-content-item">
                    <h2>${l.t('source')}: ${index + 1}</h2>
                    ${reference?.document?.length ? '<h3>' + reference.document + '</h3>' : ''}
                    ${reference?.part_title?.length ? '<h4>' + reference.part_title + '</h4>' : ''}
                    ${reference?.chapter_title?.length ? '<h5>' + reference.chapter_title + '</h5>' : ''}
                    ${reference?.article_title?.length ? '<h6>' + reference.article_title + '</h6>' : ''}
                    ${reference?.article_text?.length ? '<p>' + reference.article_text + '</p>' : ''}
                </div>
            `);
            referencesList.append(referenceItem);
        });

        // show the reference popup
        this.widgetWrapper
            .find('#hudhud-widget-reference-popup')
            .show()
            .removeClass('hudhud-widget-popup-hidden');
    }

    hideReferencePopup() {
        this.widgetWrapper.find('#hudhud-widget-reference-popup')
            .hide()
            .addClass('hudhud-widget-popup-hidden');
    }

    createWidgetWrapper(footerText) {
        const l = this.localization;
        const widgetWrapper = $(/*html*/`
            <div id="hudhud-widget-wrapper" class="${l.currentLanguage === 'ar' ? 'hudhud-widget-rtl' : ''}">
                <div id="hudhud-widget-container" class="initialized-state hudhud-widget-${this.position}-position">
                    <div id="hudhud-widget-body">
                        <div id="hudhud-widget-header-separator"></div>
                        <div id="hudhud-widget-chat-elements">                                              
                        </div>
                    </div>
                    <div id="hudhud-widget-footer">
                        <div id="hudhud-widget-footer-separator"></div>
                        <div id="hudhud-widget-footer-text">${footerText}</div>
                    </div>
                </div>
                <div id="hudhud-widget-button">
                    <button id="hudhud-widget-open-button" class="hudhud-widget-button-${this.position}-position">
                        <i class="iconoir-chat-bubble-empty-solid"></i>
                    </button>
                </div>
            </div>
        `);

        widgetWrapper.find('#hudhud-widget-container').prepend(this.widgetHeader);
        widgetWrapper.find('#hudhud-widget-footer').before(this.widgetEditor);
        widgetWrapper.find('#hudhud-widget-container').after(this.widgetWarningPopup);
        widgetWrapper.find('#hudhud-widget-container').after(this.widgetReferencePopup);
        widgetWrapper.find('#hudhud-widget-open-button').on('click', () => this.toggleWidget(widgetWrapper));

        return widgetWrapper;
    }

    switchLanguage() {
        const l = this.localization;
        $('#hudhud-widget-wrapper').toggleClass('hudhud-widget-rtl');
        l.switchToLanguage(l.currentLanguage === 'ar' ? 'en' : 'ar');
    }

    toggleWidget() {
        if (!this.triggerIsSent && this.servingMode !== 'PREVIEW') {
            this.connectSocket();
        }

        this.widgetWrapper.find('#hudhud-widget-container').removeClass('initialized-state');
        this.widgetWrapper.find('#hudhud-widget-container').toggleClass('hudhud-widget-is-open');
        this.widgetWrapper.find('#hudhud-widget-open-button').toggleClass('hudhud-widget-button-is-open');
        this.widgetWrapper.find('#hudhud-widget-open-button i').toggleClass('iconoir-chat-bubble-empty-solid iconoir-download');
        this.hideWarningPopup();
        this.hideReferencePopup();
    }

    showWarningPopup() {
        this.widgetWrapper
            .find('#hudhud-widget-warning-popup')
            .show()
            .removeClass('hudhud-widget-popup-hidden');
    }

    hideWarningPopup() {
        this.widgetWrapper.find('#hudhud-widget-warning-popup')
            .hide()
            .addClass('hudhud-widget-popup-hidden');
    }

    renderFullConversation(messages) {
        // reset the chat elements
        this.widgetChatElements.empty();
        const currentLastMessageTimestamp = parseInt(getUserData('lastMessageTimestamp'));

        messages.forEach((message, index) => {
            // if the message is of buttons type and it is not the last one, do not add it
            if (message.content_type === 'buttons' && index !== messages.length - 1) {
                return;
            }

            this.addChatElement({ type: ['Agent', 'Chatbot'].includes(message.author_by) ? 'agent-message' : 'user-message', message: message }, false);
        });

        if (parseInt(getUserData('lastMessageTimestamp')) > currentLastMessageTimestamp) {
            this.toggleWidget();
        }

        this.widgetChatElements.animate({
            scrollTop: this.widgetChatElements[0].scrollHeight
        }, 500);
    }

    addChatElement(element, scrollAnimation = true) {
        // by default, disable the editor until the specific message type enables it
        this.widgetEditor.disable();

        // stop the typing animation
        this.removeAgentIsTypingAnimation();

        switch (element.type) {
            case 'agent-message':
                switch (element.message.content_type) {
                    case 'text':
                        this.addAgentMessage(element.message);
                        storeUserData('lastMessageTimestamp', element.message.timestamp);
                        break;

                    case 'take_input':
                        this.addAgentMessage(element.message);
                        // clear the editor content
                        this.widgetEditor.find('#hudhud-widget-editor-textarea').val('');
                        this.widgetEditor.enable();
                        // focus on the editor
                        this.widgetEditor.find('#hudhud-widget-editor-textarea').focus();
                        storeUserData('lastMessageTimestamp', element.message.timestamp);
                        break;

                    case 'buttons':
                        this.AddInlineButtons(element.message);
                        storeUserData('lastMessageTimestamp', element.message.timestamp);
                        break;
                }
                break;
            case 'user-message':
                this.addUserMessage(element.message);
                break;
            case 'event-message':
                this.addEventMessage(element.message.text, element.message.type);
                break;

            case 'typing-animation':
                this.showAgentIsTypingAinimation();
                break;
            default:
                console.error('Invalid chat element type');
        }

        // Scroll smoothly to the bottom of the chat elements animation
        if (scrollAnimation) {
            this.widgetChatElements.animate({
                scrollTop: this.widgetChatElements[0].scrollHeight
            }, 500);
        }

        // Update the last interaction time from the message
    }

    addAgentMessage(message) {
        /*
        Message object example:
        {
            "message_id": "29972ac4-d250-403f-83d8-46c72fec96b8",
            "conversation_id": "966d8743-9a09-4d06-92f2-daa7f9ae3a96",
            "content_type": "take_input",
            "content": "مرحباً بك في المساعد الرقمي لتشريعات وزارة العدل 👋🏻\nيمكنني حالياً مساعدتك في التعرف على نظام المصالحة في المملكة العربية السعودية 🇸🇦",
            "author_by": "Chatbot",
            "author_name": "",
            "author_image": null,
            "is_read": false,
            "timestamp": 1724425252489,
            "button_options": "{}",
            "validation": "Text",
            "delay": 0,
            "llm_generated": false
        }
         */

        if (message.content.trim().length === 0) {
            return;
        }

        const l = this.localization;

        const messageElement = $(/*html*/`
            <div id="${message.message_id}" class="hudhud-widget-chat-message agent-message" data-timestamp="${message.timestamp}">
                <div class="hudhud-widget-chat-message-content">
                    <div class="author-details">
                        <div class="author-photo">
                            <img class="" src="${this.currentAgentImage}" />
                        </div>
                        <div class="author-name-text">
                            <div class="author-name">${this.currentAgentName}</div>
                            <div class="author-time">${days(message.timestamp).fromNow()}</div>
                        </div>
                    </div>
                    <div class="message-content">${message.content}</div>
                </div>
            </div>
        `);

        // if the message is llm_generated, add footer buttons
        if (message.llm_generated) {
            messageElement.find('.hudhud-widget-chat-message-content').after(`
                <div class="hudhud-widget-chat-message-footer">
                    <div class="hudhud-widget-chat-message-references">
                        <button class="hudhud-widget-chat-message-reference-button" style="display: none !important;">${l.t("answer_references")} <i class="iconoir-book-solid"></i> </button>
                    </div>
                    <div class="hudhud-widget-chat-message-actions">
                        <div class="hudhud-widget-chat-message-actions-feedback">
                            <button class="hudhud-widget-chat-message-feedback-button hudhud-widget-reflectable-icon" data-feedback="positive"><i class="iconoir-thumbs-up"></i></button>
                            <button class="hudhud-widget-chat-message-feedback-button hudhud-widget-reflectable-icon" data-feedback="negative"><i class="iconoir-thumbs-down"></i></button>
                        </div>
                    </div>
                </div>`);

            // add reference button event
            messageElement.find('.hudhud-widget-chat-message-reference-button').on('click', () => this.showReferencePopup(message.message_id));

            // add feedback buttons events
            messageElement.find('.hudhud-widget-chat-message-feedback-button').on('click', (e) => {
                // get the feedback value from the clicked button
                const feedbackValue = $(e.currentTarget).data('feedback');
                // send feedback event
                const sendingStatus = this.sendSocketEvent('message_feedback', {
                    message_id: message.message_id,
                    feedback: feedbackValue
                });

                if (sendingStatus) {
                    // remove the "feedback-sent" class from all feedback buttons
                    messageElement.find('.hudhud-widget-chat-message-feedback-button').removeClass('feedback-sent');

                    // add the "feedback-sent" class to the clicked button
                    $(e.currentTarget).addClass('feedback-sent');
                }
            });
        }

        this.widgetChatElements.append(messageElement);
    }

    showAgentIsTypingAinimation() {
        this.removeAgentIsTypingAnimation();
        const messageElement = $(/*html*/`
            <div class="hudhud-widget-chat-message agent-message">
                <div class="hudhud-widget-chat-message-content">
                    <div class="author-details">
                        <div class="author-photo">
                            <img class="" src="${this.currentAgentImage}" />
                        </div>
                        <div class="author-name-text">
                            <div class="author-name">${this.currentAgentName}</div>
                            
                        </div>
                    </div>
                    <div class="message-content" style="white-space: nowrap !important;">
                    <div class="hudhud-widget-typing-effect">
                        <span class="hudhud-widget-typing-effect-dot" id="dot1"></span>
                        <span class="hudhud-widget-typing-effect-dot" id="dot2"></span>
                        <span class="hudhud-widget-typing-effect-dot" id="dot3"></span>
                    </div>
                    </div>
                </div>
            </div>
        `);

        this.widgetChatElements.append(messageElement);
    }

    removeAgentIsTypingAnimation() {
        this.widgetChatElements.find('.hudhud-widget-typing-effect').closest('.hudhud-widget-chat-message').remove();
    }

    addUserMessage(message) {
        const l = this.localization;

        const messageElement = $(/*html*/`
            <div class="hudhud-widget-chat-message user-message" data-timestamp="${message.timestamp}">
                <div class="hudhud-widget-chat-message-content">
                    <div class="author-details">
                        <div class="author-photo">
                            <img class="" src="" />
                        </div>
                        <div class="author-name-text">
                            <div class="author-name">${l.t('you')}</div>
                            <div class="author-time">${days(message.timestamp).fromNow()}</div>
                        </div>
                    </div>
                    <div class="message-content">${message.content}</div>
                </div>
                <div class="hudhud-widget-chat-message-footer">
                </div>
            </div>
        `);

        this.widgetChatElements.append(messageElement);
    }

    addEventMessage(event, type = "info") {
        const messageElement = $(/*html*/`
            <div class="hudhud-widget-event-message hudhud-widget-${type}">
                <div class="hudhud-widget-chat-message-content">
                    <div class="message-content">${event}</div>
                </div>
            </div>
        `);

        this.widgetChatElements.append(messageElement);
    }

    AddInlineButtons(message) {
        // TODO: add button id to the button element
        const buttonsMessage = $(/*html*/`
        <div class="hudhud-widget-chat-message agent-message" data-timestamp="${message.timestamp}">
            <div class="hudhud-widget-chat-message-content">
                <div class="author-details">
                    <div class="author-photo">
                        <img class="" src="${this.currentAgentImage}" />
                    </div>
                    <div class="author-name-text">
                        <div class="author-name">${this.currentAgentName}</div>
                        <div class="author-time">منذ دقيقتين</div>
                    </div>
                </div>
                ${message.content && message.content.length ? `<div class="message-content">${message.content}</div>` : ''}
                <div class="hudhud-widget-inline-buttons-container">${JSON.parse(message.button_options).map(button => `<button class="hudhud-widget-inline-button">${button}</button>`).join('')}
                </div>
            </div>
            <div class="hudhud-widget-chat-message-footer">
            </div>
        </div>`);

        // add click event to the buttons
        buttonsMessage.find('.hudhud-widget-inline-button').on('click', (e) => {
            // get the text of the clicked button
            const buttonContent = $(e.currentTarget).text();

            // send the button content as a message
            this.sendSocketEvent('new_message', buttonContent, 'text');

            // unbind click events from the buttons
            buttonsMessage.find('.hudhud-widget-inline-button').off('click');
        });

        this.widgetChatElements.append(buttonsMessage);
    }
}

export default HudhudWidget;