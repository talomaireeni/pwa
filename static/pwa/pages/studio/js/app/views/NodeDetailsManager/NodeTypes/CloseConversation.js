/**
 * Node Details Manager view must comply with the following:
 * 1. It must be a class with a constructor that takes the following parameters:
 *   1.1. node: The node to manage.
 *   1.2. nodeData: The node data.
 *   1.3 availableVariables: The available variables for the node.
 * 2. It must have a view property that contains the view of the node details manager.
 * 3. It must have a validate method that validates the node details.
 * 4. It must have an export method that exports the node details.
*/

/**
 * Returns the CloseConversation node type view.
 * @description: This is the view that is shown when a Close Conversation node is selected.
 * It contains a single createNewQuillEditor form element
 * @param {string} node - The node to manage.
 * @param {string} nodeData - The data of the node.
 * @param {Array} availableVariables - The available variables for the node.
 * @returns {jQuery} - The Close Conversation node type view.
*/

import NodeDetailsManagerTemplate from './NodeDetailsManagerTemplate.js';
import RichEditor from '../FormElements/Common/RichEditor.js';

const minLength = 0;
const maxLength = 1000;
const showEmoji = true;
class CloseConversation extends NodeDetailsManagerTemplate {
    constructor(node, nodeData, availableVariables = []) {
        super(node, nodeData, availableVariables);
        // create the view
        this.view = $(/*html*/`
            <div class="node-details-manager">
                <div class="form-elements">
                    <div class="form-group">
                        <label for="node-name">Closure message</label>
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
        return {
            data: this.editor.export()
        };
    }
}



export default CloseConversation;