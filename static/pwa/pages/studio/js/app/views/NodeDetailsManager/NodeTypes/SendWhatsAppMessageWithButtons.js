/**
 * Returns the SendWhatsAppMessageWithButtons node type view.
 * @description: This is the view that is shown when a SendWhatsAppMessageWithButtons node is selected.
 * It contains a single createNewQuillEditor form element
 * @param {string} node - The node to manage.
 * @param {string} nodeData - The data of the node.
 * @param {Array} availableVariables - The available variables for the node.
 * @returns {jQuery} - The SendWhatsAppMessageWithButtons node type view.
*/

import NodeDetailsManagerTemplate from './NodeDetailsManagerTemplate.js';
import RichEditor from '../FormElements/Common/RichEditor.js';
import ViewRepeater from '../ViewRepeater.js';
import SaveAnswer from '../FormElements/Common/SaveAnswer.js';
import UploadFile from '../FormElements/Common/UploadFile.js';

const maxOutputs = 3;
const minLength = 1;
const maxLength = 1000;
const showEmoji = true;

class SendWhatsAppMessageWithButtons extends NodeDetailsManagerTemplate {
    constructor(node, nodeData, portsData, availableVariables = []) {
        super(node, nodeData, portsData, availableVariables);

        const buttonView = $(/*html*/`
        <div class="form-group">
            <input type="text" class="form-control" data-key="buttonLabel" data-output-port-id="" placeholder="Enter button label">
        </div>        
        `);

        const buttonValidator = (viewItem) => {
            let valid = true;
            let errors = [];
            // const buttonGroup = viewItem.find('[data-key="buttonGroup"]').val();
            const buttonLabel = viewItem.find('[data-key="buttonLabel"]').val();

            // // buttonGroup and buttonLabel are required and must be at least 1 character long and less than 20 characters long
            // if (buttonGroup.length < 1) {
            //     valid = false;
            //     errors.push({
            //         errorText: 'Button group is required.',
            //         errorElement: viewItem.find('[data-key="buttonGroup"]')
            //     });
            // }

            // if (buttonGroup.length > 20) {
            //     valid = false;
            //     errors.push({
            //         errorText: 'Button group must be less than 20 characters long.',
            //         errorElement: viewItem.find('[data-key="buttonGroup"]')
            //     });
            // }

            if (buttonLabel.length < 1) {
                valid = false;
                errors.push({
                    errorText: 'Button label is required.',
                    errorElement: viewItem.find('[data-key="buttonLabel"]')
                });
            }

            if (buttonLabel.length > 20) {
                valid = false;
                errors.push({
                    errorText: 'Button label must be less than 20 characters long.',
                    errorElement: viewItem.find('[data-key="buttonLabel"]')
                });
            }

            return {
                valid: valid,
                errors: errors
            };
        };

        this.viewRepeater = new ViewRepeater(buttonView, buttonValidator, nodeData?.buttons || [], maxOutputs, true, ViewRepeater.INLINE);

        // create the view
        this.view = $(/*html*/`
            <div class="node-details-manager">
                <div class="form-elements">
                </div>
            </div>
        `);

        // render the view inside #edit-node-modal div
        $('#edit-node-modal .modal-body').append(this.view);

        this.uploadFile = new UploadFile('image,video,document', nodeData?.fileUpload?.fileUploadEnabled, nodeData?.fileUpload?.fileSource, availableVariables, nodeData?.fileUpload?.fileSourceDetails || null);
        this.view.find('.form-elements').append(this.uploadFile.render());


        // create the editor
        this.view.find('.form-elements').append(`
        <div class="form-group node-form-element">
            <label for="quill-editor-1">Your message here:</label>
        </div>`);
        this.editor = new RichEditor(this.data?.editorId, this.view.find('.form-elements'), this.availableVariables, showEmoji, minLength, maxLength, 'Good bye message ..', nodeData || null);
        this.editor.render();

        // Save answer
        const definedVariable = this.nodeData?.definedVariable || null;
        this.saveAnswer = new SaveAnswer(definedVariable?.variableId, definedVariable?.variableName, definedVariable?.variableType, definedVariable?.enabled);

        this.view.append(this.viewRepeater.render());
        this.view.append(this.saveAnswer.render());
    }

    validate() {
        let valid = true;
        let errors = [];

        // validate the message editor
        const editorValidation = this.editor.validate();
        valid = editorValidation.valid;
        errors = errors.concat(editorValidation.errors);

        // validate the upload file
        if (this.uploadFile.validate().valid === false) {
            valid = false;
            errors = errors.concat(this.uploadFile.validate().errors);
        }

        // validate the view repeater
        if (this.viewRepeater.validate().valid === false) {
            valid = false;
            errors = errors.concat(this.viewRepeater.validate().errors);
        }

        // validate the save answer
        if (this.saveAnswer.validate().valid === false) {
            valid = false;
            errors = errors.concat(this.saveAnswer.validate().errors);
        }

        return {
            valid: valid,
            errors: errors
        };
    }

    export() {
        this.viewRepeater.updatePorts(this.node);
        return {
            data: {
                ...this.editor.export(),
                ...{ snippet: this.editor.generateSnippet() },
                ...{ fileUpload: this.uploadFile.export() },
                ...{ buttons: this.viewRepeater.getData() },
                ...{ definedVariable: this.saveAnswer.export() }
            }
        };
    }
}

export default SendWhatsAppMessageWithButtons;