/**
 * Returns the SendWhatsAppMessage node type view.
 * @description: This is the view that is shown when a SendWhatsAppMessage node is selected.
 * It contains a single createNewQuillEditor form element
 * @param {string} node - The node to manage.
 * @param {string} nodeData - The data of the node.
 * @param {Array} availableVariables - The available variables for the node.
 * @returns {jQuery} - The Close Conversation node type view.
*/

import NodeDetailsManagerTemplate from './NodeDetailsManagerTemplate.js';
import { generateUUID } from '../../../models/utilities.js'
import RichEditor from '../FormElements/Common/RichEditor.js';

const minLength = 1;
const maxLength = 1000;
const showEmoji = true;

class SendWhatsAppMessage extends NodeDetailsManagerTemplate {
    constructor(node, nodeData, portsData, availableVariables = []) {
        super(node, nodeData, portsData, availableVariables);
        // create the view
        this.view = $(/*html*/`
            <div class="node-details-manager">
                <div class="form-elements">
                    <div class="form-group">
                        <label for="node-name">Send message</label>
                    </div>
                </div>
            </div>
        `);

        // render the view inside #edit-node-modal div
        $('#edit-node-modal .modal-body').append(this.view);
        this.editor = new RichEditor(this.data?.editorId, this.view.find('.form-elements'), availableVariables, showEmoji, minLength, maxLength, 'Good bye message ..', nodeData || null);
        this.editor.render();
    }

    validate() {
        let valid = true;
        let errors = [];

        // validate the new editor
        const editorValidation = this.editor.validate();
        valid = editorValidation.valid;
        errors = editorValidation.errors;

        return {
            valid: valid,
            errors: errors
        };
    }

    export() {
        // if node output port is not created yet, create it
        if (this.node.ports.outputPorts.length === 0) {
            this.node.addOutputPort(this.node.parentGraph.createOutputPort(generateUUID()));
        }

        return {
            data: {
                ...this.editor.export(),
                ...{snippet: this.editor.generateSnippet()}
            }
        };
    }
}

export default SendWhatsAppMessage;