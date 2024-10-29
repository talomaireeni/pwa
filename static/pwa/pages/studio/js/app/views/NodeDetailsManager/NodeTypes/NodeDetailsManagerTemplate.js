
/**
 * This is a template for all NodeManagers to follow.
 * @description: Node Details Manager view must comply with the following:
 * 1. It must be a class with a constructor that takes the following parameters:
 *   1.1. node: The node to manage.
 *   1.2. nodeData: The node data.
 *   1.3 availableVariables: The available variables for the node.
 * 2. It must have a view property that contains the view of the node details manager.
 * 3. It must have a validate method that validates the node details.
 * 4. It must have an export method that exports the node details.
 * @param {string} node - The node to manage.
 * @param {string} nodeData - The data of the node.
 * @param {Array} portsData - The data of the ports of the node.
 * @param {Array} availableVariables - The available variables for the node.
 * @returns {jQuery} - The Close Conversation node type view.
*/

class NodeDetailsManagerTemplate {
    constructor(node, nodeData, portsData, availableVariables = []) {
        this.node = node;
        this.nodeData = nodeData;
        this.portsData = portsData;
        this.availableVariables = availableVariables;

        // create the view
        this.view = $(/*html*/`
            <div class="node-details-manager">
                <div class="form-elements">
                </div>
            </div>
        `);

        // render the view inside #edit-node-modal div
        $('#edit-node-modal .modal-body').append(this.view);
    }
}

export default NodeDetailsManagerTemplate;