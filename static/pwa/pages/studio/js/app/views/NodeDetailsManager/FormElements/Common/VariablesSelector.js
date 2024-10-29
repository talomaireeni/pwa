/**
This file contains VariableSelector.js which is a class that is used to create a VariablesSelector form element.
The class has a constructor that takes in an elementId, availableVariables, selectedVariableId, and mode.
The render function creates an HTML view for the form element.

The view consists of the following:
- An inline editable input field.
- The available variables are displayed as a dropdown list and they are triggered by the input field (typeahead)
- The selected variable is displayed as a badge inside the input field.
 */

/**
 * class VariablesSelector
 * Description: This class is used to create a VariablesSelector form element.
 * @param {string} elementId - The element id.
 * @param {Array} availableVariables - The available variables to display in the list.
 * @param {string} selectedVariableId - The selected variable id.
 * @param {string} values - The values to display in the input field as a mix of text and badges.
 * @returns {string} - The VariablesDropDownList HTML.
 */

import { generateUUID } from '../../../../models/utilities.js';
class VariablesSelector {
    constructor(elementId, availableVariables, variableSelectorValues = null) {
        this.elementId = elementId || generateUUID();
        this.availableVariables = availableVariables || [];
        this.variableSelectorValues = variableSelectorValues;
        this.dropdownList = null;
        this.placeholder = 'Please select a variable ...';
    }

    /**
     * @function render
     * @description Render the form element.
     * Create a view for .node-form-element.
     * @returns {jQuery} - The form element.
     */
    render() {
        // create a select element with the available variables
        this.view = $(/*html*/`
            <div class="form-group node-form-element variables-selector">
                <div class="form-control form-select text-muted" id="variables-selector-${this.elementId}" style="">${this.placeholder}</div>
            </div>
        `);

        // if the variableSelectorValues is not null, add the values to the input field
        if (this.variableSelectorValues) {
            let html = '';
            this.variableSelectorValues.forEach((value) => {
                if (value.variableId) {
                    const variable = this.availableVariables.find(variable => variable.variableId === value.variableId);
                    if (variable) {
                        html += `<span class="badge variable-badge bg-primary" contenteditable="false" data-variable-id="${variable.variableId}">${variable.variableName}<button type="button" class="btn-close custom-btn-close"><i class="iconoir-xmark" style="height: .65rem;"></i></button></span>`;
                    }
                }
                else if (value.text) {
                    html += `${value.text}`;
                }
            });

            this.view.find(`#variables-selector-${this.elementId}`).html(html);

            // listen for click events on the close button
            this.view.find('.custom-btn-close').click((e) => {
                e.stopPropagation();
                e.preventDefault();
                // remove the badge from the input field
                $(e.target).closest('.badge').remove();
                this.updatePlaceholder();
            });

            setTimeout(() => { this.updatePlaceholder(); }, 1);
        }

        // append the dropdown list to the view
        this.view.append(this.generateDropDownList());
        // once the div variables-selector-${this.elementId}" is clicked make it editable
        this.view.find(`#variables-selector-${this.elementId}`).click((e) => {
            // prevent event propagation
            e.stopPropagation();

            $(e.target)
                .attr('contenteditable', 'true')
                .css('white-space', 'pre-wrap')
                .focus();

            this.updatePlaceholder();

            // get the position of the cursor, if it is 0 and the last element is a badge, move the cursor to the end of the input field
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            if (range.startOffset === 0 && $(e.target).children().last().hasClass('badge')) {
                range.setStartAfter($(e.target).children().last()[0]);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            // show the dropdown
            if (!this.dropdownList) {
                this.dropdownList = $(`#variables-selector-${this.elementId}`).next().find('.dropdown-menu');

                // initialize the dropdown list
                const toggle = this.dropdownList.parent().find('.dropdown-toggle');
                new bootstrap.Dropdown(toggle[0]);

                // hide all other dropdown lists
                $('.variables-selector .dropdown-menu').hide();
                
                this.dropdownList.show();

                // listen for click events on the dropdown list
                this.dropdownList.find('.dropdown-item').click((e) => {
                    const selectedVariable = $(e.target).text();
                    const selectedVariableId = $(e.target).attr('data-variable-id');
                    // add the selected variable to the input field as a badge
                    const newBadge = $(/*html*/`<span class="badge variable-badge bg-primary" contenteditable="false" data-variable-id="${selectedVariableId}">${selectedVariable}<button type="button" class="btn-close custom-btn-close"><i class="iconoir-xmark" style="height: .65rem;"></i></button></span>`);

                    // prevent newBadge from being editable or clickable
                    newBadge.click((e) => {
                        e.stopPropagation();
                        return false;
                    });

                    // listen for click events on the close button
                    newBadge.find('.custom-btn-close').click((e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // remove the badge from the input field
                        $(e.target).closest('.badge').remove();
                        this.updatePlaceholder();
                        // hide the dropdown list
                        this.dropdownList.hide();
                    });

                    /**
                     * Insert the new badge inside the input field, as follows:
                     * 1. get the position of the cursor
                     * 2. insert the new badge at the cursor position
                     * 3. move the cursor right after the badge
                     * 4. hide the dropdown list
                    */

                    // 1. get the position of the cursor
                    const selection = window.getSelection();
                    const range = selection.getRangeAt(0);

                    // insert a &nbsp; after the badge
                    const space = document.createTextNode('\u00A0');
                    range.insertNode(space);

                    // 2. insert the new badge at the cursor position
                    range.insertNode(newBadge[0]);

                    // 3. move the cursor after the newly created badge
                    range.setStartAfter(newBadge[0]);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    // focus the input field
                    $(`#variables-selector-${this.elementId}`).focus();

                    // 5. hide the dropdown list
                    this.dropdownList.hide();
                });
            }
            else {
                $('.variables-selector .dropdown-menu').hide();
                this.dropdownList.show();
            }

            // listen for click events outside the dropdown list
            $(document).one('click', (e) => {
                if (!$(e.target).closest('.variables-selector').length) {
                    this.view.find(`#variables-selector-${this.elementId}`).blur();
                    this.dropdownList.hide();

                    // make the input field non-editable and show the placeholder
                    $(`#variables-selector-${this.elementId}`).attr('contenteditable', 'false');
                    this.updatePlaceholder();
                }
            });
        });

        this.view.find(`#variables-selector-${this.elementId}`).blur((e) => {
            // if the dropdown list is not visible, make the input field non-editable and show the placeholder
            if (!this.dropdownList.is(':visible')) {
                $(e.target).attr('contenteditable', 'false');
                this.updatePlaceholder();
            }
        });

        return this.view;
    }

    /**
     * @function generateDropDownList
     * @description Generate the bootstrap 5 dropdown list.
     * @returns {string} - The dropdown list HTML.
     */
    generateDropDownList() {
        // create and initialize a hidden bootstrap 5 dropdown list
        const list = $(/*html*/`
        <div class="dropdown">
            <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown"
            aria-expanded="false" style="display:none;">
            Dropdown link
            </a>
            <ul class="dropdown-menu w-100" aria-labelledby="dropdownMenuLink">
                ${this.availableVariables.map(variable => { return `<li><a class="dropdown-item" href="#" data-variable-id="${variable.variableId}">${variable.variableName}</a></li>`; }).join('')}
            </ul>
        </div>
        `);

        return list;
    }

    /**
     * @function updatePlaceholder
     * @description Toggle the placeholder in and out based on the content of the input field.
     * @returns {void}
     */
    updatePlaceholder() {
        if ($(`#variables-selector-${this.elementId}`).text().trim() === '') {
            $(`#variables-selector-${this.elementId}`).text(this.placeholder).addClass('text-muted');
        }
        else if ($(`#variables-selector-${this.elementId}`).text().trim() === this.placeholder) {
            // if active element is input field, remove the placeholder
            if (document.activeElement === $(`#variables-selector-${this.elementId}`)[0]) {
                $(`#variables-selector-${this.elementId}`).text('').removeClass('text-muted');
            } else {
                $(`#variables-selector-${this.elementId}`).addClass('text-muted');
            }
        }
        else {
            $(`#variables-selector-${this.elementId}`).removeClass('text-muted');
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

        // check if the input field is empty or contains only the placeholder
        if ($(`#variables-selector-${this.elementId}`).text().trim() === '' || $(`#variables-selector-${this.elementId}`).text().trim() === this.placeholder) {
            valid = false;
            errors.push({
                errorText: 'Please select a variable or enter a value.',
                errorElement: $(`#variables-selector-${this.elementId}`)
            });
        }

        return {
            valid: valid,
            errors: errors
        };
    }

    /**
     * @function export
     * @description Export the element value as JSON.
     * @returns {Object} - The element value.
     */
    export() {
        const childNodes = $(`#variables-selector-${this.elementId}`)[0].childNodes;
        // convert the HTML to a list of variables and text
        const values = [];


        for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i].tagName === 'SPAN') {
                const variableId = $(childNodes[i]).attr('data-variable-id');
                if (variableId) {
                    values.push({ "variableId": variableId });
                }
            }
            else {
                if (childNodes[i].textContent.trim().length > 0) {
                    values.push({ "text": childNodes[i].textContent });
                }
            }
        }

        const exportValue = {
            variableSelectorValues: values
        };

        return exportValue;
    }
}

export default VariablesSelector;