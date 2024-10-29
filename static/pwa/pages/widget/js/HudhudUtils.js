/**
 * This file contains utility functions for Hudhud Widget
 */

/**
 * This function is used to generate a uuid
 * @returns {string}
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * This function is used to store the user data in the local storage
 */
function storeUserData(key, value) {
    localStorage.setItem('hudhud-widget-' + key, value);
}

/**
 * This function is used to get the user data from the local storage
 */

function getUserData(key) {
    return localStorage.getItem('hudhud-widget-' + key) || '';
}

function removeUserData(key) {
    localStorage.removeItem('hudhud-widget-' + key);
}

// TODO: create urlify(), sanitize() functions

export { generateUUID, storeUserData, getUserData, removeUserData };