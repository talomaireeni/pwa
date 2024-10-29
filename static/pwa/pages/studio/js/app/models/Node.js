import { InputPort, OutputPort } from './Port.js';
import { FLOW_CONTROL_NODES, WHATSAPP_NODES, DATA_MANAGEMENT_NODES } from '../nodesDefinitions.js';

const nodeTypes = [...FLOW_CONTROL_NODES, ...WHATSAPP_NODES, ...DATA_MANAGEMENT_NODES];

class Node {
    /**
     * Creates a new Node object.
     * @param {string} id - The ID of the node.
     * @param {string} name - The name of the node.
     * @param {string} type - The type of the node.
     * @param {Graph} parentGraph - The graph that the node belongs to.
     */

    constructor(id, name, type, parentGraph) {
        this.id = id;
        this.parentGraph = parentGraph;
        this.name = name;
        this.type = type;
        this.ports = {
            inputPort: null,
            outputPorts: [],
        };

        this.parentGraph.eventEmitter.fire('nodeCreated', this);
        // listen to edgeDeleted event
        this.parentGraph.eventEmitter.on('edgeDeleted', event => {
            // check if the current node is the destination of the edge
            if (event.edge.toPort.parentNode.id === this.id) {
                // check if the parent node of the source port was the parent node of the current node, then fire the 'nodeParentChanged' event
                if (event.edge.fromPort.parentNode.id === event.previousDistinationNodeId) {
                    this.parentGraph.eventEmitter.fire('nodeParentChanged', this);
                }
            }
        });
    }

    /**
     * Adds an input port to the node.
     * @param {InputPort} port - The input port to add.
     * @throws {Error} An error is thrown if the node already has an input port.
     * @throws {Error} An error is thrown if the port is not an input port.
     */
    addInputPort(port) {
        if (this.ports.inputPort) {
            throw new Error('Node already has an input port.');
        }

        if (!(port instanceof InputPort)) {
            throw new Error('Port is not an input port.');
        }

        port.parentNode = this;
        this.ports.inputPort = port;
        this.parentGraph.eventEmitter.fire('inputPortAddedToNode', this);
    }

    /**
     * Adds an output port to the node.
     * @param {OutputPort} port - The output port to add.
     * @throws {Error} An error is thrown if the port is not an output port.
     */
    addOutputPort(port) {
        if (!(port instanceof OutputPort)) {
            throw new Error('Port is not an output port.');
        }

        port.parentNode = this;
        this.ports.outputPorts.push(port);
        this.parentGraph.eventEmitter.fire('outputPortAddedToNode', this);
    }


    /**
     * Creates an OutputPort and adds it to the node.
     * @param {String} lable - An optional port label.
     * @returns {OutputPort} The created port.
     * @throws {Error} An error is thrown if the the node has already reached the maximum number of output ports.
     */
    createOutputPort(portId, label) {
        const nodeType = nodeTypes.find(nodeType => nodeType.type === this.type);
        const maxNumberOfOutputPorts = nodeType.maxOutputs || 99;

        if (this.ports.outputPorts.length >= maxNumberOfOutputPorts) {
            throw new Error('Node has reached the maximum number of output ports.');
        }

        const port = this.parentGraph.createOutputPort(portId);
        this.addOutputPort(port);
        if (label?.length > 0) {
            // fire portLabelChanged event
            this.parentGraph.eventEmitter.fire('portLabelChanged', { port: port, label: label });
        }
        return port;
    }

    /**
     * Reorders a node's output port at the specified index.
     * @param {number} oldIndex - The current index of the port.
     * @param {number} newIndex - The new index of the port.
     * @returns {boolean} True if the port was reordered, false otherwise.
     * @throws {Error} An error is thrown if the old index is out of bounds.
     * @throws {Error} An error is thrown if the new index is out of bounds.
     * @throws {Error} An error is thrown if the node does not have any output ports.
     */
    reorderOutputPort(oldIndex, newIndex) {
        if (oldIndex < 0 || oldIndex >= this.ports.outputPorts.length) {
            throw new Error('Old index is out of bounds.');
        }
        if (newIndex < 0 || newIndex >= this.ports.outputPorts.length) {
            throw new Error('New index is out of bounds.');
        }
        if (this.ports.outputPorts.length === 0) {
            throw new Error('Node does not have any output ports.');
        }

        const [port] = this.ports.outputPorts.splice(oldIndex, 1);
        this.ports.outputPorts.splice(newIndex, 0, port);
        this.parentGraph.eventEmitter.fire('outputPortReordered', this);
        return true;
    }

    /**
     * Returns an array of edges connected to the node.
     * @returns {Edge[]} An array containing all edges connected to the node.
     * @throws {Error} An error is thrown if the node does not have any ports.
     */
    getNodeEdges() {
        if (!this.ports.inputPort && this.ports.outputPorts.length === 0) {
            throw new Error('Node does not have any ports.');
        }

        let ports = [];
        if (this.ports.inputPort) {
            ports.push(this.ports.inputPort);
        }
        ports = ports.concat(this.ports.outputPorts);

        let edges = Object.values(this.parentGraph.edges);
        edges = edges.filter(edge => ports.some(port => port.id === edge.fromPort.id || port.id === edge.toPort.id));

        return edges;
    }

    /**
     * Returns the parent node of the current node. The parent node is the first node in the path from the current node to the root node.
     * @returns {Node} The parent node of the current node.
     * @throws {Error} An error is thrown if the node does not have any ports.
     * @throws {Error} An error is thrown if the node is not connected to the graph.
     */
    getParentNode() {
        if (!this.ports.inputPort && this.ports.outputPorts.length === 0) {
            throw new Error('Node does not have any ports.');
        }
        if (!this.parentGraph.nodes[this.id]) {
            throw new Error('Node is not connected to the graph.');
        }

        if (this.getNodesInPath('up').length > 0) {
            const edges = this.getNodeEdges();
            const parentNode = edges.find(edge => edge.toPort.parentNode.id === this.id).fromPort.parentNode;

            return parentNode;
        }
        else {
            return null;
        }
    }

    /**
     * Returns all ancestors or descendants of the node recursivly.
     * @returns {Node[]} An array containing all ancestors or descendants of the node.
     * @throws {Error} An error is thrown if the node is not connected to the graph.
     */
    getNodesInPath(direction, visitedNodes = []) {
        if (!this.parentGraph.nodes[this.id]) {
            throw new Error('Node is not connected to the graph.');
        }

        visitedNodes.push(this);
        let edges, nodes;

        if (direction === 'down') {
            edges = this.getNodeEdges().filter(edge => edge.fromPort.parentNode.id === this.id);
            nodes = edges.map(edge => edge.toPort.parentNode);
        }
        else if (direction === 'up') {
            edges = this.getNodeEdges().filter(edge => edge.toPort.parentNode.id === this.id);
            nodes = edges.map(edge => edge.fromPort.parentNode);
        }
        else {
            throw new Error('Direction (up/down) must be provided.');
        }

        // Remove duplicates
        const uniqueNodes = [];
        for (const parentNode of nodes) {
            if (!uniqueNodes.some(uniqueParentNode => uniqueParentNode.id === parentNode.id)) {
                uniqueNodes.push(parentNode);
            }
        }

        // Remove already visited nodes
        const unvisitedNodes = uniqueNodes.filter(node => !visitedNodes.some(visitedNode => visitedNode.id === node.id));

        // Remove the current node
        const filteredNodes = unvisitedNodes.filter(node => node.id !== this.id);

        if (filteredNodes.length === 0) {
            return [];
        }
        else {
            return filteredNodes.concat(filteredNodes.map(node => node.getNodesInPath(direction, visitedNodes)).flat());
        }
    }

    /**
     * Deletes a node from the graph.
     */
    deleteNode() {
        // delete all edges connected to the node
        const edges = this.getNodeEdges();
        edges.forEach(edge => edge.deleteEdge());

        this.parentGraph.eventEmitter.fire('nodeDeleted', this);
        delete this.parentGraph.nodes[this.id];
    }

    /**
     * Export the node to a JSON object without circular references.
     * @returns {JSON} A JSON object representation of the node.
     */
    exportJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            inputPort: this.ports.inputPort?.exportJSON(),
            outputPorts: this.ports.outputPorts.map(port => port.exportJSON()),
        };
    }

    /**
     * Imports a node from a JSON object.
     * @param {JSON} json - The JSON object to import.
     * @param {Graph} parentGraph - The graph that the node belongs to.
     * @returns {Node} The imported node.
     * @static
     */
    static importJSON(json, parentGraph) {
        let node = new Node(json.id, json.name, json.type, parentGraph);

        // import ports
        if (json.inputPort) {
            node.addInputPort(new InputPort(json.inputPort.id, node, parentGraph.eventEmitter));
        }

        json.outputPorts.forEach((port) => {
            node.addOutputPort(new OutputPort(port.id, node, parentGraph.eventEmitter));
        });

        return node;
    }
}

export default Node;