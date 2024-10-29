/**
 * @class ViewRepeater
 * @description View Repeater: this utility class is used to create a view that contains a list of 
 * identical views of the same type.
 * @param {object} view - The jQuery view to render the view repeater inside.
 * @param {object} viewValidator - The view validator function to validate the view item.
 * @param {Array} data - The data to render the view with.
 * @param {Number} limit - The maximum number of views to render, 99 (virtually unlimitted) by default.
 * @param {boolean} reorderable - Whether the view repeater is reorderable or not.
 * @returns {jQuery} - The view repeater.
 */

import { generateUUID } from '../../models/utilities.js';

class ViewRepeater {
    static INLINE = 'inline';
    static BLOCK = 'block';

    constructor(view, viewValidator = null, data, limit = 99, reorderable = false, displayMode = ViewRepeater.BLOCK, sharedCounter = false) {
        this.viewsContainer = $(/*html*/`
            <div class="view-repeater">
                <div class="view-repeater-header">
                    <div class="view-repeater-header-title"></div>
                    <div class="view-repeater-body"></div>
                    <div class="view-repeater-header-actions">
                        <div class="view-repeater-footer">
                            <span class="counter"></span>
                        </div>
                        <button class="view-repeater-header-action add btn btn-sm btn-outline-primary" style="display:flex;">Add another button
                        <i class="iconoir-plus-circle-solid p-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);
        this.view = view;
        this.viewValidator = viewValidator;
        this.data = data;
        this.limit = limit;
        this.reorderable = reorderable;
        this.displayMode = displayMode;
    }

    /**
     * @function renderViewItem
     * @description Render a view item.
     * @param {Number} index - The index of the view item.
     * @returns {jQuery} - The view item.
     */
    renderViewItem(index, itemData = null) {
        const viewItem = $(/*html*/`
        <div id="view-repeater-item-${index}" class="node-form-element view-repeater-item ${this.displayMode}">
            <div class="view-repeater-item-container">
                <div class="view-repeater-item-reorder"></div>
                <div class="view-repeater-item-contents ${this.displayMode}">
                    <div class="view-repeater-item-header">
                        <div class="view-repeater-item-header-title"></div>
                    </div>
                    <div class="view-repeater-item-body ${this.displayMode}"></div>
                    <div class="view-repeater-item-actions ${this.displayMode}">
                        <span class="view-repeater-item-action delete"
                            style="display:flex;"><i class="iconoir-minus-circle p-1"></i> Delete</span>
                    </div>
                </div>
            </div>
        </div>       
        `);

        // render a clone of the view inside the view item body
        viewItem.find('.view-repeater-item-body').append(this.view.clone(true, true));

        // if itemData is not null, set the values of the fields with data-key attribute
        if (itemData) {
            viewItem.find('[data-key]').each((index, item) => {
                const element = $(item);
                element.val(itemData[element.attr('data-key')]);
                // set the data-output-port-id attribute if itemData has outputPortId property
                if (itemData?.outputPortId) {
                    element.attr('data-output-port-id', itemData.outputPortId);
                }
            });
        }
        else {
            // this is a new item, generate a new id for data-output-port-id elements
            viewItem.find('[data-output-port-id]').each((index, item) => {
                const element = $(item);
                element.attr('data-output-port-id', generateUUID());
            });
        }


        viewItem.find('.view-repeater-item-action.delete').click(() => {
            viewItem.remove();
            this.updateCounter();
        });

        // listen to enter key press event of the input elements other than the last one in the view item, then focus the next input element
        viewItem.find('.view-repeater-item-body input').not(':last').on('keypress', (e) => {
            if (e.key === 'Enter') {
                $(e.target).next('input').focus();
            }
        });

        // listen to enter key press event of the last input element in the view item
        viewItem.find('.view-repeater-item-body input').last().on('keypress', (e) => {
            if (e.key === 'Enter') {
                this.viewsContainer.find('.view-repeater-header-action.add').click();
                // focus on the first input element of the new view item
                this.viewsContainer.find('.view-repeater-item').last().find('input').first().focus();
            }
        });

        return viewItem;
    }

    /**
     * @function updateCounter
     * @description Update the counter of the view repeater.
     * @returns {void}
     *  */

    updateCounter() {
        // TODO: explain why we access the classes directly instead of using this.viewsContainer.find ...
        const container = (this.sharedCounter ? body : this.viewsContainer);

        container.find('.view-repeater-footer .counter').text(`Added ${container.find('.view-repeater-item').length} of ${this.limit}`);
        if (container.find('.view-repeater-item').length === this.limit) {
            container.find('.view-repeater-header-action.add').attr('disabled', true);
        }
        else {
            container.find('.view-repeater-header-action.add').attr('disabled', false);
        }

        // update reorder icons according to the index of the view item

        if (this.reorderable) {
            const viewItemsCount = this.viewsContainer.find('.view-repeater-item').length;

            this.viewsContainer.find('.view-repeater-item').each((index, item) => {
                const viewItem = $(item);
                const viewItemIndex = this.viewsContainer.find('.view-repeater-item').index(viewItem);
                if (viewItemIndex === 0) {
                    viewItem.find('.view-repeater-item-reorder').empty();
                    viewItem.find('.view-repeater-item-reorder').append($(/*html*/`
                        <div class="view-repeater-item-reorder-down">
                            <i class="iconoir-arrow-down-circle"></i>
                        </div>
                    `));
                }

                if (viewItemIndex === viewItemsCount - 1) {
                    viewItem.find('.view-repeater-item-reorder').empty();
                    viewItem.find('.view-repeater-item-reorder').append($(/*html*/`
                        <div class="view-repeater-item-reorder-up">
                            <i class="iconoir-arrow-up-circle"></i>
                        </div>
                    `));
                }

                if (viewItemIndex > 0 && viewItemIndex < viewItemsCount - 1) {
                    viewItem.find('.view-repeater-item-reorder').empty();
                    viewItem.find('.view-repeater-item-reorder').append($(/*html*/`
                        <div class="view-repeater-item-reorder-up">
                            <i class="iconoir-arrow-up-circle"></i>
                        </div>
                        <div class="view-repeater-item-reorder-down">
                            <i class="iconoir-arrow-down-circle"></i>
                        </div>
                    `));
                }
            });

            // add click event to the reorder buttons
            this.viewsContainer.find('.view-repeater-item-reorder-up').off('click').click((e) => {
                e.stopPropagation();
                const viewItem = $(e.target).closest('.view-repeater-item');
                const viewItemIndex = this.viewsContainer.find('.view-repeater-item').index(viewItem);
                if (viewItemIndex > 0) {
                    viewItem.prev().before(viewItem);
                    this.updateCounter();
                }
            });

            this.viewsContainer.find('.view-repeater-item-reorder-down').off('click').click((e) => {
                e.stopPropagation();
                const viewItem = $(e.target).closest('.view-repeater-item');
                const viewItemIndex = this.viewsContainer.find('.view-repeater-item').index(viewItem);
                if (viewItemIndex < viewItemsCount - 1) {
                    viewItem.next().after(viewItem);
                    this.updateCounter();
                }
            });
        }
    }

    /**
     * @function render
     * render the view repeater.
     * @returns {jQuery} - The view repeater.
     */

    render() {
        // add the add button click event
        this.viewsContainer.find('.view-repeater-header-action.add').click(() => {
            // if the limit is not reached, add a new view item
            const container = (this.sharedCounter ? body : this.viewsContainer);
            
            if (container.find('.view-repeater-item').length < this.limit) {
                this.viewsContainer.find('.view-repeater-body').append(this.renderViewItem(this.viewsContainer.find('.view-repeater-item').length));

                // get current scroll position of .modal-body
                const currentScroll = this.viewsContainer.closest('.modal-body').scrollTop();
                // get y-coordinate of the last view item
                const y = this.viewsContainer.find('.view-repeater-item').last().offset().top;

                // scroll .modal-body to the y-coordinate of the last view item
                this.viewsContainer.closest('.modal-body').animate({
                    scrollTop: y + currentScroll - 150
                }, 500);

                // focus the first input element of the newly created view item
                this.viewsContainer.find('.view-repeater-item').last().find('input').first().focus();
            }

            this.updateCounter();
        });

        // if data length is > 0, render the views
        if (this.data.length > 0) {
            // render the views
            this.data.forEach((item, index) => {
                // if index is less than limit, render the view
                if (index < this.limit) {
                    const viewItem = this.renderViewItem(index, item);
                    this.viewsContainer.find('.view-repeater-body').append(viewItem);
                }
            });
        }
        else {
        }

        // update the counter
        this.updateCounter();

        return this.viewsContainer;
    }

    /**
     * @function getData
     * @description Get the data from the view repeater be getting the value of the fields with data-key attribute.
     * @returns {Array} - The data.
     */

    getData() {
        const data = [];
        this.viewsContainer.find('.view-repeater-item').each((index, item) => {
            const viewItem = $(item);
            const itemData = {};

            viewItem.find('[data-key]').each((index, item) => {
                const element = $(item);
                itemData[element.data('key')] = element.val();

                // if the element has data-output-port-id attribute, add a new key to the itemData object
                if (element.data('output-port-id')) {
                    itemData['outputPortId'] = element.data('output-port-id');
                }
            });
            data.push(itemData);
        });

        return data;
    }

    /**
     * @function validate
     * @description Validate the view repeater.
     * @returns {boolean} - The validation result.
     */

    validate() {
        let valid = true;
        let errors = [];

        // first, check if the view repeater is empty
        if (this.viewsContainer.find('.view-repeater-item').length === 0) {
            valid = false;
            errors.push({
                errorText: 'Please add at least one item.',
                errorElement: this.viewsContainer.find('.view-repeater-header-actions')
            });
        }

        // then validate each view item
        this.viewsContainer.find('.view-repeater-item').each((index, item) => {
            const repeaterItem = $(item);
            if (this.viewValidator) {
                const result = this.viewValidator(repeaterItem);
                if (!result.valid) {
                    valid = false;
                    errors = errors.concat(result.errors);
                }
            }
        });

        return {
            valid: valid,
            errors: errors
        };
    }

    /**
     * @function updatePorts
     * @description Update the output ports of the node with the new data.
     * @param {Node} currentNode - The current node.
     */

    updatePorts(currentNode) {
        /**
         * manager output ports:
         * 1- get ViewRepeater data -> options
         * 2- update the node output ports with the new data or create new output ports if needed
         */

        // get ViewRepeater data -> options itemData: { "outputPortId": String, "${optionKey}": String }
        const options = this.getData();
        const optionKey = this.viewsContainer.find('[data-output-port-id]').filter(':first').data('key');

        // get current node output ports
        const outputPorts = currentNode.ports.outputPorts;

        // get all output ports that are in the options and update their labels
        const outputPortsInButtons = outputPorts.filter(port => options.find(option => option.outputPortId === port.id));
        outputPortsInButtons.forEach(port => {
            const newLabel = options.find(option => option.outputPortId === port.id)[optionKey];
            port.updateLabel(newLabel);
        });

        // get all output ports that are not in the options
        const outputPortsNotInButtons = outputPorts.filter(port => !options.find(option => option.outputPortId === port.id));

        // remove the output ports that are not in the options
        outputPortsNotInButtons.forEach(port => {
            port.deletePort();
        });

        // get all options that are not in the node output ports
        const optionsNotInOutputPorts = options.filter(option => !outputPorts.find(port => port.id === option.outputPortId));

        // create new output ports for the options that are not in the node output ports
        optionsNotInOutputPorts.forEach(option => {
            currentNode.createOutputPort(option.outputPortId, option[optionKey]);
        });

        // update the order of the output ports in the currentNode to match the order of the options
        options.forEach((option, index) => {
            currentNode.reorderOutputPort(currentNode.ports.outputPorts.findIndex(port => port.id === option.outputPortId), index);
        });
    }
}
export default ViewRepeater;