/**
 * Utility functions for the application
 */

const generateUUID = function () {
    let uuid = '';
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            uuid += '-';
        } else if (i === 14) {
            uuid += '4';
        } else {
            uuid += hexDigits[Math.floor(Math.random() * 16)];
        }
    }
    return uuid;
}

class EventEmitter {

    /* defining the following events:
       - 'graphCreated'
       - 'nodeCreated'
       - 'nodeUpdated'
       - 'nodeDeleted'
       - 'nodeParentChanged'
       - 'portCreated'
       - 'portDeleted'
       - 'inputPortAddedToNode'
       - 'outputPortAddedToNode'
       - 'outputPortReordered'
       - 'edgeCreated'
       - 'edgeDeleted'
       */

    static graphCreated = 'graphCreated';
    static nodeCreated = 'nodeCreated';
    static nodeUpdated = 'nodeUpdated';
    static nodeDeleted = 'nodeDeleted';
    static nodeParentChanged = 'nodeParentChanged';
    static nodeDetailsSet = 'nodeDetailsSet';
    static portCreated = 'portCreated';
    static portDeleted = 'portDeleted';
    static inputPortAddedToNode = 'inputPortAddedToNode';
    static outputPortAddedToNode = 'outputPortAddedToNode';
    static outputPortReordered = 'outputPortReordered';
    static edgeCreated = 'edgeCreated';
    static edgeDeleted = 'edgeDeleted';
    static portLabelChanged = 'portLabelChanged';

    /**
     * Creates a new EventEmitter.
     * 
     */
    constructor() {
        this.events = {};
    }

    /**
     * Fires an event with the given name and data.
     * @param {string} eventName - The name of the event to fire.
     * @param {object} eventData - The data to pass to the event listeners.
     */
    fire(eventName, eventData) {
        const listeners = this.events[eventName];
        if (listeners) {
            listeners.forEach(listener => listener(eventData));
        }
    }

    /**
     * Registers an event listener for the given event name.
     * @param {string} eventName - The name of the event to listen for.
     * @param {function} listener - The function to call when the event is fired.
     * The listener function should accept one parameter, which is the eventData object.
     */
    on(eventName, listener) {

        // if eventName is array, then add the listener to all events in the array
        if (Array.isArray(eventName)) {
            eventName.forEach(event => this.on(event, listener));
            return;
        }

        // check if the event name is not defined
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(listener);
    }

    /**
     * Removes an event listener for the given event name.
     * @param {string} eventName - The name of the event to remove the listener from.
     * @param {function} listener - The listener function to remove.
     */
    off(eventName, listener) {
        const listeners = this.events[eventName];
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
}

export { generateUUID, EventEmitter };