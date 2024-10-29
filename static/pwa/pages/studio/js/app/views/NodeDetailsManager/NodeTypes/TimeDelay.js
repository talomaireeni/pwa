/**
 * Returns the TimeDelay node type view.
 * @description: This is the view that is shown when a TimeDelay node is selected.
 * @param {string} node - The node to manage.
 * @param {string} nodeData - The data of the node.
 * @param {Array} availableVariables - The available variables for the node.
 * @returns {jQuery} - The Close Conversation node type view.
*/

import NodeDetailsManagerTemplate from './NodeDetailsManagerTemplate.js';
import { generateUUID } from '../../../models/utilities.js';

class TimeDelay extends NodeDetailsManagerTemplate {
    constructor(node, nodeData, availableVariables = []) {
        super(node, nodeData, availableVariables);
        // create the view
        this.view = $(/*html*/`
            <div class="node-details-manager">
                <div class="form-elements node-form-element">
                    <div class="form-group">
                        <label for="node-delay">Delay</label>
                        <input type="number" class="form-control" id="node-delay" placeholder="Enter delay in seconds" value="${nodeData?.delay || 0}">
                    </div>
                </div>
            </div>
        `);

        // render the view inside #edit-node-modal div
        $('#edit-node-modal .modal-body').append(this.view);
    }

    validate() {
        const delay = parseInt($('#node-delay').val());
        if (isNaN(delay)) {
            return {
                valid: false,
                message: 'Delay must be a number.'
            };
        }
        return {
            valid: true,
            message: ''
        };
    }
    export() {
        // if node output port is not created yet, create it
        if (this.node.ports.outputPorts.length === 0) {
            this.node.createOutputPort(generateUUID());
        }
        return {
            data: {
                delay: parseInt($('#node-delay').val()),
                snippet: `Wait for ${$('#node-delay').val()} seconds before continuing to the next step.`

            }
        };
    }
}



export default TimeDelay;