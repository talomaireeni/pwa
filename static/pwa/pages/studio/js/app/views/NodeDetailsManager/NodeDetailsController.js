/**
 * @class NodeDetailsController
 * 
 * Manages the node details view.
 */

// import NodeDetailsManagers
import NodeDetailsManagerTemplate from './NodeTypes/NodeDetailsManagerTemplate.js';
import SendWhatsAppMessage from './NodeTypes/SendWhatsAppMessage.js';
import SendWhatsAppMessageWithButtons from './NodeTypes/SendWhatsAppMessageWithButtons.js';
import SendWhatsAppMessageWithList from './NodeTypes/SendWhatsAppMessageWithList.js';
import CloseConversation from './NodeTypes/CloseConversation.js';
import TimeDelay from './NodeTypes/TimeDelay.js';

class NodeDetailsController {
  /**
   * Creates a new instance of NodeDetailsController.
   * @param {Flow} flow - The flow to manage.
   */
  constructor(flow) {
    this.flow = flow;
  }

  renderEditNodeModal(nodeId) {
    const node = this.flow.graph.nodes[nodeId];

    // if nodeId is not found, throw an error
    if (!nodeId || !node) {
      throw new Error('node is not found');
    }

    // remove previous modal, if exists
    $('#edit-node-modal').remove();

    // render the modal
    let modal = $(/*html*/`
        <div class="modal fade" id="edit-node-modal" tabindex="-1" aria-labelledby="edit-node-modal-label" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered1">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="create-node-modal-label">
                  <p style="margin:0;">${node.name}</p>
                  <i class="iconoir-edit" style="color:var(--bs-gray-500);"></i>
                </h5>
                <div class="header-actions">
                  <div class="node-delete-btn">
                    <div id="delete-node-btn" class="btn btn-sm btn-outline-danger" style="transition: all .3s ease-in-out">
                      Delete node
                    <i class="iconoir-trash"></i>
                    </div>
                  </div>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
              </div>
              <div class="modal-body">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Discard</button>
                <button type="button" class="btn btn-primary" id="save-node-details-btn">Save changes</button>
              </div>
            </div>
          </div>
        </div>
        `);

    // make the node title editable
    modal.find('h5#create-node-modal-label p')
      .attr('contenteditable', 'true')
      .attr('contenteditable', 'true')
      .attr('spellcheck', 'false')
      .attr('plaintext-only', 'true');

    // listen to the keyup event on the node title
    modal.find('h5#create-node-modal-label p').keyup((e) => {
      // if the enter key is pressed, blur the element
      if (e.key === 'Enter') {
        $(e.target).blur();
      }
    });

    // listen to the blur event on the node title
    modal.find('h5#create-node-modal-label p').blur((e) => {
      // update the node name
      const newName = $(e.target).text() || node.name;
      this.flow.graph.nodes[nodeId].name = newName;
      this.flow.autoSave();
    });

    // if the modal is not rendered yet, render it and add it to the body
    if ($('#edit-node-modal').length === 0) {
      $('body').append(modal);
    }

    // the modal is already rendered, we can add the node details view to it

    /** 
     * this code is used to create a new instance of the node manager class dynamically.
     * All node managers share the same interface by design.
     */

    const nodeData = this.flow.details.nodes[nodeId] || null;
    const portsData = this.flow.graph.nodes[nodeId].ports.outputPorts.map((port) => {
      const data = {
        "id": port.id,
        "details": this.flow.details.ports[port.id]
      };
      return data;
    });

    const availableVariables = this.flow.getAvailableVariables(nodeId);
    const nodeManagerClassName = node.type;

    const dynamicScript = `new ${nodeManagerClassName}(node, nodeData, portsData, availableVariables)`;
    let nodeManager = eval(dynamicScript);

    // check if the node manager is an instance of NodeDetailsManagerTemplate and has the required methods
    if (!(nodeManager instanceof NodeDetailsManagerTemplate) || !typeof nodeManager.export === 'function' || !typeof nodeManager.validate === 'function') {
      throw new Error('NodeDetailsManagerTemplate is not implemented correctly');
    }

    // add click event to the delete node button
    modal.find('#delete-node-btn').click((e) => {
      e.stopPropagation();

      // get data state from button
      const state = $(e.target).data('state');

      // id state is confirm, then delete the node, else change the button text to "Are you sure?"
      if (state !== 'confirm') {
        // change the button text to "Are you sure?"
        $(e.target)
          .data('state', 'confirm')
          .text('Are you sure?')
          .addClass('btn-lg')
          .removeClass('btn-sm');
      }
      else {
        // delete the node
        this.flow.graph.nodes[nodeId].deleteNode();
        this.flow.autoSave();
        this.flow.eventEmitter.fire('nodeDeleted', {});
        // hide the modal
        modal.modal('hide');
      }
    });

    // add click event to the create node button
    modal.find('#save-node-details-btn').click((e) => {
      e.stopPropagation();
      const validation = nodeManager.validate();
      // if is not valid, disable the save button, add invalid-element class to the form element and show the error message
      if (!validation.valid) {
        // remove invalid-element class from the form elements and remove the error messages
        nodeManager.view.find('.invalid-element').removeClass('invalid-element');
        nodeManager.view.find('.error-message').remove();

        const errors = validation.errors; // array of {errorText: 'error message', errorElement: jQueryElement}
        // loop through the errors array and show the error message
        errors.forEach(error => {
          // add invalid-element class to the form element
          error.errorElement.addClass('invalid-element');
          // show the error message
          error.errorElement
            .after(/*html*/`
          <div class="error-message"><i class="iconoir-warning-circle"></i> ${error.errorText}</div>
          `);
        });

      }
      else {
        // if is valid, enable the save button, remove invalid class from the form element and hide the error message
        nodeManager.view.find('.node-form-element').removeClass('invalid-element');
        nodeManager.view.find('.error-message').remove();

        // update the node data
        const node = this.flow.graph.nodes[nodeId];

        // export the node data
        const nodeData = nodeManager.export().data;
        this.flow.setNodeDetails(node, nodeData)

        // hide the modal
        modal.modal('hide');

        // remove the node details view
        nodeManager.view.remove();
      }
    });

    // show the modal
    modal.modal('show');
  }
}

export default NodeDetailsController;