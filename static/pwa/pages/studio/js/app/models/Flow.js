/*
Flow class is used to create a flow object that contains the flow's name, description, and graph.
A flow has an id, name, description, stage, state , graph, and details.

*/

import { generateUUID, EventEmitter } from './utilities.js';
import Graph from './Graph.js';
/**
 * Represents a flow that contains a graph.
 * @class
 * @property {string} id - The ID of the flow.
 * @property {string} name - The name of the flow.
 * @property {string} description - The description of the flow.
 * @property {string} stage - The stage of the flow.
 * @property {string} state - The state of the flow.
 * @property {Graph} graph - The graph of the flow.
 * @property {Object} details - The details of the flow. It contains the following properties:
 * - nodes: The nodes of the flow
 * - ports: The ports of the flow
 * - edges: The edges of the flow
 * - definedVariables: The defined variables of the flow
 * 
 * @property {EventEmitter} eventEmitter - The event emitter of the flow. 
*/
class Flow {
    constructor(id, name, description, stage, state, graph, details) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.stage = stage;
        this.state = state;
        this.graph = graph;
        this.details = details || {
            nodes: {},
            ports: {},
            edges: {},
            definedVariables: {}
        };
        this.eventEmitter = graph.eventEmitter;

        this.eventEmitter.fire('flowCreated', this);

        /* listen to the following events:
        - 'nodeDeleted'
        - 'nodeParentChanged'
        - 'edgeDeleted'
        - 'nodeDetailsSet'
        */

        this.eventEmitter.on(EventEmitter.nodeDeleted, event => {
            delete this.details.nodes[event?.id];
            this.autoSave();
        });

        this.eventEmitter.on(EventEmitter.edgeDeleted, event => {
            delete this.details.edges[event?.edge?.id];
            this.autoSave();
        });

        this.eventEmitter.on(EventEmitter.nodeDetailsSet, event => {
            this.autoSave();
        });

        this.eventEmitter.on(EventEmitter.portLabelChanged, event => {
            this.setPortLabel(event.port.id, event.label);
            this.autoSave();
        });

        this.eventEmitter.on(EventEmitter.portDeleted, event => {
            delete this.details.ports[event.id];
            this.autoSave();

        });

    }

    /**
     * Auto save the flow to the local storage
     * @returns {void}
     */
    autoSave() {

        // change the icon inside .flow-activity to spinner
        const savingIndicatorIcon = $('.flow-activity i');
        savingIndicatorIcon
            .removeClass('iconoir-check')
            .addClass('iconoir-refresh-circle')
            .addClass('spinning')
            .next().text('Saving changes ..');

        setTimeout(() => {
            localStorage.setItem('flow-' + this.id, JSON.stringify(this.exportJSON()));
            this.eventEmitter.fire('flowAutoSaved', this);
            savingIndicatorIcon
                .removeClass('spinning')
                .removeClass('iconoir-refresh-circle')
                .addClass('iconoir-check')
                .next().text('All changes saved');
        }, 1500);
    }

    /**
     * Set node's details in details.nodes object
     * @param {string} node Node
     * @param {Object} details Node's details
     * @throws {Error} Node not found
     * @returns {void}
     */
    setNodeDetails(node, details) {
        if (!node) {
            throw new Error('Node not found');
        }

        this.details.nodes[node.id] = { ...this.details.nodes[node.id], ...details };

        // if node is orphan, do not fire the event (to prevent infinite loop)
        if (node.getNodeEdges().length !== 0) {
            this.eventEmitter.fire('nodeDetailsSet', node);
        }

        this.autoSave();
    }

    /**
     * Set edge's details
     * @param {string} edgeId Edge's id
     * @param {Object} details Edge's details
     * @throws {Error} Edge not found
     * @returns {void}
     */
    setEdgeDetails(edgeId, details) {
        const edge = this.graph.edges[edgeId];
        if (!edge) {
            throw new Error('Edge not found');
        }
        this.details.edges[edgeId] = { ...this.details.edges[edgeId], ...details };
        this.eventEmitter.fire('edgeDetailsSet', edge);
        this.autoSave();
    }

    /**
     * Set port's label
     * @param {string} portId Port's id
     * @param {string} label Port's label
     * @throws {Error} Port not found
     * @returns {void}
     */
    setPortLabel(portId, label) {
        const port = Object.keys(this.graph.nodes).reduce((acc, nodeId) => {
            return acc || this.graph.nodes[nodeId].ports.outputPorts.find(port => port.id === portId);
        });

        if (!port) {
            throw new Error('Port not found');
        }
        this.details.ports[portId] = { ...this.details.ports[portId], label: label };

        this.autoSave();
    }

    /**
     * Get available variables for a node
     * @param {string} nodeId Node's id
     * @returns {Array} Available variables
     */
    getAvailableVariables(nodeId) {
        // get the node
        const node = this.graph.nodes[nodeId];

        // get nodes in the path from current node to the root node
        const ancestorsNodes = node.getNodesInPath('up', []);

        // loop through the nodes and get their details from the flow
        const availableVariables = ancestorsNodes.map(node => {
            return this.details.nodes[node.id]?.definedVariable;
        }).filter(variable => variable)
            .filter(variable => variable.enabled);

        return availableVariables;
    }

    // shortcuts for graph methods

    /**
     * Create a node from port id
     * @param {string} fromPortId Node's id
     * @param {string} name Node's name
     * @param {string} type Node's type
     * @param {Number} number of children
     * @returns {Node} Node object
     */

    createNode(fromNodeId, fromPortId, name, type, numberOfChildren = 0) {
        // create a node from the graph
        let node = this.graph.createNode(generateUUID(), name, type);

        // create the node's (InputPort)
        node.addInputPort(this.graph.createInputPort(generateUUID()));

        // create the node's children (OutputPorts)
        for (let i = 0; i < numberOfChildren; i++) {
            node.addOutputPort(this.graph.createOutputPort(generateUUID()));
        }

        // find the port from the graph
        const fromPort = this.graph.nodes[fromNodeId].ports.outputPorts.find(port => port.id === fromPortId);
        const toPort = node.ports.inputPort;

        // create the edge between the node and the port
        this.graph.createEdge(generateUUID(), fromPort, toPort);

        return node;
    }

    /**
    * Export the flow to a JSON object
    * @returns {Object} JSON object
    */
    exportJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            stage: this.stage,
            state: this.state,
            graph: this.graph.exportJSON(),
            details: this.details
        }
    }

    /**
     * Import the flow from a JSON object
     * @param {Object} flowJSON JSON object
     * @returns {Flow} Flow object
     * @static
     */
    static importJSON(flowJSON) {
        return new Flow(
            flowJSON.id,
            flowJSON.name,
            flowJSON.description,
            flowJSON.stage,
            flowJSON.state,
            Graph.importJSON(flowJSON.graph),
            flowJSON.details
        );
    }
}

export default Flow;