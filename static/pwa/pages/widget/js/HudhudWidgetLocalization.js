/**
 * Class to handle localization of the widget. It has the following methods:
 * switchToLanguage: switch the widget's language
 * storeLanguage: store the selected language to local storage
 * getStoredLanguage: get the stored language from local storage
 * getMessages: get the messages in the selected language
 * 
 * When initialized, it will check if there is a stored language in the local storage, if not, it will use the default language.
 * When switching the language, it will store the selected language in the local storage.
 */
import messages from './messages.js';
import { storeUserData, getUserData } from './HudhudUtils.js';
class HudhudWidgetLocalization {
    constructor(supportedLanguages, defaultLanguage) {
        this.supportedLanguages = supportedLanguages;
        this.defaultLanguage = defaultLanguage;
        this.currentLanguage = this.getStoredLanguage() || this.defaultLanguage;
        this.setMessages(messages);
    }

    setMessages(messages) {
        const messagesMap = new Map();
        messages.forEach((message) => {
            messagesMap.set(Object.keys(message)[0], message[Object.keys(message)[0]]);
        });

        this.messages = messagesMap;
    }

    switchToLanguage(language) {
        if (this.supportedLanguages.includes(language)) {
            // if the language is different from the currentLanguage
            if (language !== this.currentLanguage) {
                this.currentLanguage = language;
                this.storeLanguage(language);
                this.updateMessages();
            }
        }
    }

    storeLanguage(language) {
        storeUserData('language', language);
    }

    getStoredLanguage() {
        return getUserData('language');
    }

    getMessages() {
        return this.messages;
    }

    getMessage(key) {
        // return the message in the current language
        let message = this.messages.get(key);
        return message ? message[this.currentLanguage] : key;
    }

    // shortcut method
    t(key) {
        return this.getMessage(key);
    }

    updateMessages() {
        return;
    }
}

export default HudhudWidgetLocalization;