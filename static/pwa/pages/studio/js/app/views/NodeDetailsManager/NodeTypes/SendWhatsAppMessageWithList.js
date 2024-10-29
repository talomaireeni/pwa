/**
 * Returns the SendWhatsAppMessageWithList node type view.
 * @description: This is the view that is shown when a SendWhatsAppMessageWithList node is selected.
 * It contains a single createNewQuillEditor form element
 * @param {string} node - The node to manage.
 * @param {string} nodeData - The data of the node.
 * @param {Array} availableVariables - The available variables for the node.
 * @returns {jQuery} - The SendWhatsAppMessageWithList node type view.
*/

import NodeDetailsManagerTemplate from './NodeDetailsManagerTemplate.js';
import RichEditor from '../FormElements/Common/RichEditor.js';
import ViewRepeater from '../ViewRepeater.js';
import SaveAnswer from '../FormElements/Common/SaveAnswer.js';

const maxOutputs = 10;
const minLength = 1;
const maxLength = 1000;
const showEmoji = true;

class SendWhatsAppMessageWithList extends NodeDetailsManagerTemplate {
    static definedButtonRepeaters = [];

    constructor(node, nodeData, portsData, availableVariables = []) {
        super(node, nodeData, portsData, availableVariables);

        const buttonView = $(/*html*/`
        <div class="form-group">
            <label for="buttonDescription">Button</label>
            <input type="text" class="form-control" data-key="buttonLabel" data-output-port-id="" placeholder="Enter button name">
            <input type="text" class="form-control mt-1" data-key="buttonDescription" placeholder="Enter button description">
        </div>        
        `);

        const buttonValidator = (viewItem) => {
            let valid = true;
            let errors = [];
            const buttonDescription = viewItem.find('[data-key="buttonDescription"]').val();
            const buttonLabel = viewItem.find('[data-key="buttonLabel"]').val();

            if (buttonLabel.length < 1) {
                valid = false;
                errors.push({
                    errorText: 'Button label is required.',
                    errorElement: viewItem.find('[data-key="buttonLabel"]')
                });
            }

            if (buttonLabel.length > 24) {
                valid = false;
                errors.push({
                    errorText: 'Button label must be less than 24 characters long.',
                    errorElement: viewItem.find('[data-key="buttonLabel"]')
                });
            }

            if (buttonDescription.length > 72) {
                valid = false;
                errors.push({
                    errorText: 'Button description must be less than 72 characters long.',
                    errorElement: viewItem.find('[data-key="buttonDescription"]')
                });
            }

            return {
                valid: valid,
                errors: errors
            };
        };

        this.viewRepeater = new ViewRepeater(buttonView, buttonValidator, nodeData?.buttons || [], maxOutputs, true, ViewRepeater.INLINE, true);

        // create the view
        this.view = $(/*html*/`
            <div class="node-details-manager">
                <div class="form-elements">
                </div>
            </div>
        `);

        // render the view inside #edit-node-modal div
        $('#edit-node-modal .modal-body').append(this.view);

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

        this.initializeSections();
        this.view.append(this.renderSections());
        this.view.append(this.saveAnswer.render());
    }

    initializeSections() {
        SendWhatsAppMessageWithList.definedButtonRepeaters = [];

        // create sections container
        this.sectionsContainer = $(/*html*/`
            <div class="form-elements">
                <div class="form-group node-form-element" style="display: flex; flex-direction: row;align-items: center;justify-content: space-between;margin: 15px 0;">
                    <h5>Sections</h5>
                    <button type="button" class="btn btn-primary btn-sm" id="add-section" style="display: flex;align-items: center;"><i class="iconoir-plus"></i> Add section</button>
                </div>
            </div>`);

        // if there are sections, add them to the sections container
        if (this.nodeData?.sections) {
            this.nodeData.sections.forEach((section) => {
                this.addNewSection(section.sectionTitle, section.buttons);
            });
        }

        // listen for the add section button click
        this.sectionsContainer.find('#add-section').on('click', () => {
            this.addNewSection();
        });
    }

    addNewSection(sectionTitle = '', repeaterData = []) {
        // create the section
        const section = $(/*html*/`
            <div class="form-group node-form-element buttons-section">
                <div class="buttons-section-header">
                    <label>Section title</label>
                    <div id="delete-node-btn" class="btn btn-sm btn-outline-danger" style="font-size: x-small">
                      Delete section
                    <i class="iconoir-trash"></i>
                    </div>
                </div>
                <input type="text" class="form-control" placeholder="Enter section title" value="${sectionTitle}">
            </div>`);

        const buttonView = $(/*html*/`
        <div class="form-group mt-2">
            <input type="text" class="form-control" data-key="buttonLabel" data-output-port-id="" placeholder="Enter button name">
            <input type="text" class="form-control mt-1" data-key="buttonDescription" placeholder="Enter button description">
        </div>        
        `);

        const buttonValidator = (viewItem) => {
            let valid = true;
            let errors = [];
            const buttonDescription = viewItem.find('[data-key="buttonDescription"]').val();
            const buttonLabel = viewItem.find('[data-key="buttonLabel"]').val();

            if (buttonLabel.length < 1) {
                valid = false;
                errors.push({
                    errorText: 'Button label is required.',
                    errorElement: viewItem.find('[data-key="buttonLabel"]')
                });
            }

            if (buttonLabel.length > 24) {
                valid = false;
                errors.push({
                    errorText: 'Button label must be less than 24 characters long.',
                    errorElement: viewItem.find('[data-key="buttonLabel"]')
                });
            }

            if (buttonDescription.length > 72) {
                valid = false;
                errors.push({
                    errorText: 'Button description must be less than 72 characters long.',
                    errorElement: viewItem.find('[data-key="buttonDescription"]')
                });
            }

            return {
                valid: valid,
                errors: errors
            };
        };

        let buttonRepeater = new ViewRepeater(buttonView, buttonValidator, repeaterData, maxOutputs, true, ViewRepeater.INLINE, true);
        // listen for the delete section button click
        section.find('#delete-node-btn').on('click', () => {
            section.remove();
            // remove the repeater from the definedButtonRepeaters array
            SendWhatsAppMessageWithList.definedButtonRepeaters = SendWhatsAppMessageWithList.definedButtonRepeaters.filter((repeater) => repeater !== buttonRepeater);
        });

        SendWhatsAppMessageWithList.definedButtonRepeaters.push(buttonRepeater);
        section.append(buttonRepeater.render());
        this.sectionsContainer.append(section);

        self.repeaters = SendWhatsAppMessageWithList.definedButtonRepeaters;

        // scroll to the bottom of the sections container
        // get the last section y-coordinate
        const lastSection = this.sectionsContainer.find('.buttons-section').last();
        const lastSectionY = lastSection.offset().top + lastSection.height();
        // scroll .modal-body to the last section
        $('#edit-node-modal .modal-body').animate({
            scrollTop: lastSectionY
        }, 500);
    }

    renderSections() {
        return this.sectionsContainer;
    }

    validate() {
        let valid = true;
        let errors = [];

        // validate the message editor
        const editorValidation = this.editor.validate();
        valid = editorValidation.valid;
        errors = errors.concat(editorValidation.errors);

        // validate the sections, section title length should be between 1 and 24 characters
        this.sectionsContainer.find('.buttons-section').each((index, section) => {
            const sectionTitle = $(section).find('input').val();
            if (sectionTitle.length < 1) {
                valid = false;
                errors.push({
                    errorText: 'Section title is required.',
                    errorElement: $(section).find('input')
                });
            }

            if (sectionTitle.length > 24) {
                valid = false;
                errors.push({
                    errorText: 'Section title must be less than 24 characters long.',
                    errorElement: $(section).find('input')
                });
            }
        });

        // validate the view repeaters, each repeater should have at least one button
        SendWhatsAppMessageWithList.definedButtonRepeaters.forEach((repeater) => {
            const repeaterValidation = repeater.validate();
            valid = repeaterValidation.valid && valid;
            errors = errors.concat(repeaterValidation.errors);
        });

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

    updatePorts() {
        /**
         * manager output ports (similar to the updatePorts method in the ViewRepeater class):
         * 
         * 1- get all ViewRepeaters data
         * 2- update the node output ports with the new data or create new output ports if needed
         */

        // get all ViewRepeaters data
        let sections = [];
        this.sectionsContainer.find('.buttons-section').each((index, section) => {
            const sectionTitle = $(section).find('input').val();
            const buttons = SendWhatsAppMessageWithList.definedButtonRepeaters[index].getData();
            sections.push({
                sectionTitle: sectionTitle,
                buttons: buttons
            });
        });

        const optionKey = this.sectionsContainer.find('.buttons-section:first .view-repeater-item-body:first input')
            .filter('[data-key="buttonLabel"]')
            .data('key');

        // get all options with outputPortId key
        let options = sections.map((section) => section.buttons).flat();

        // get all output ports
        let outputPorts = this.node.ports.outputPorts;
        const currentNode = this.node;

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

    export() {
        // export sections
        let sections = [];
        this.sectionsContainer.find('.buttons-section').each((index, section) => {
            const sectionTitle = $(section).find('input').val();
            const buttons = SendWhatsAppMessageWithList.definedButtonRepeaters[index].getData();
            sections.push({
                sectionTitle: sectionTitle,
                buttons: buttons
            });

            // update the output ports
            this,this.updatePorts();
        });

        return {
            data: {
                ...this.editor.export(),
                ...{ snippet: this.editor.generateSnippet() },
                ...{ sections: sections },
                ...{ definedVariable: this.saveAnswer.export() }
            }
        };
    }
}

export default SendWhatsAppMessageWithList;