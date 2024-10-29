/**
 * SaveAnswer form element.
 * @class SaveAnswer
 * Description: This class is used to create a SaveAnswer form element.
 * 
 * @param {string} variableId - The variable id.
 * @param {string} variableName - The variable name.
 * @param {string} variableType - The variable type.
 * @returns {jQuery} - The SaveAnswer form element.
 */

import { generateUUID } from '../../../../models/utilities.js';

class SaveAnswer {
    constructor(variableId, variableName, variableType, enabled) {
        this.variableId = variableId || generateUUID();
        this.variableName = variableName || '';
        this.variableType = variableType || 'text';
        this.enabled = enabled || false;
    }

    /**
     * @function render
     * @description Render the form element.
     * Create a view for .node-form-element.
     * The view consists of:
     * - a toggle button to enable/disable the form element
     * - an input field to enter the variable name
     * @returns {jQuery} - The form element.
     */
    render() {
        this.view = $(/*html*/`
            <div class="form-group node-form-element">
                <div class="form-check form-switch">
                    <input type="checkbox" class="form-check-input" role="switch" id="save-answer-toggle-${this.variableId}">
                    <label class="form-check-label" for="save-answer-toggle-${this.variableId}">Save user's answer?</label>
                </div>
                <input type="text" class="form-control" data-variable-id="${this.variableId}" placeholder="Enter variable name">
            </div>
        `);



        // set the value of the toggle button
        if (this.enabled) {
            this.view.find('.form-check-input').prop('checked', true);
        }

        // hide the variable name input field if the toggle button is not checked (disabled)
        if (!this.view.find('.form-check-input').is(':checked')) {
            this.view.find('input[type="text"]').hide();
        }

        // set the variable name
        this.view.find('input[type="text"]').val(this.variableName);

        // set the variable type
        this.view.find('input[type="text"]').attr('data-variable-type', this.variableType);

        // add click event to the toggle button
        this.view.find('.form-check-input').click((e) => {
            e.stopPropagation();
            if (this.view.find('.form-check-input').is(':checked')) {
                this.view.find('input[type="text"]').show();
                // scroll to the newly shown input field and focus on it
                this.view.find('input[type="text"]').get(0).scrollIntoView();
                this.view.find('input[type="text"]').focus();

            }
            else {
                this.view.find('input[type="text"]').hide();
            }
        });

        return this.view;
    }

    /**
     * @function export
     * @description Export the form element data.
     * @returns {Object} - The form element data.
     */
    export() {
        const saveAnswer = {
            variableId: this.variableId,
            variableName: this.view.find('input[type="text"]').val(),
            variableType: this.view.find('input[type="text"]').attr('data-variable-type'),
            enabled: this.view.find('.form-check-input').is(':checked')
        };

        return saveAnswer;
    }

    /**
     * @function import
     * @description Import the form element data.
     * @param {Object} data - The form element data.
     * @returns {void}
     */
    import(data) {
        this.variableId = data.variableId;
        this.variableName = data.variableName;
        this.variableType = data.variableType;

        // set the variable name
        this.view.find('input[type="text"]').val(this.variableName);

        // set the variable type
        this.view.find('input[type="text"]').attr('data-variable-type', this.variableType);

        // set the toggle button
        if (data.enabled) {
            this.view.find('.form-check-input').prop('checked', true);
            this.view.find('input[type="text"]').show();
        }
        else {
            this.view.find('.form-check-input').prop('checked', false);
            this.view.find('input[type="text"]').hide();
        }
    }

    /**
     * @function validate
     * @description Validate the form element.
     * @returns {Object} - The validation result.
     */
    validate() {
        let valid = true;
        let errors = [];
        const variableName = this.view.find('input[type="text"]').val();

        // variableName is required and must be at least 1 character long and less than 20 characters long
        if (variableName.length < 1 && this.view.find('.form-check-input').is(':checked')) {
            valid = false;
            errors.push({
                errorText: 'Variable name is required.',
                errorElement: this.view.find('input[type="text"]')
            });
        }

        if (variableName.length > 20) {
            valid = false;
            errors.push({
                errorText: 'Variable name must be less than 20 characters long.',
                errorElement: this.view.find('input[type="text"]')
            });
        }

        // if the variable name contains any of the the following special characters return false
        const specialCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', '|', '\\', ':', ';', '"', '\'', '<', '>', ',', '.', '?', '/', '`', '~'];
        if (specialCharacters.some(character => variableName.includes(character))) {
            valid = false;
            errors.push({
                errorText: 'Variable name cannot contain a special characters.',
                errorElement: this.view.find('input[type="text"]')
            });
        }

        return {
            valid: valid,
            errors: errors
        };
    }
}

export default SaveAnswer;