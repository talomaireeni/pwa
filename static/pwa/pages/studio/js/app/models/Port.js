import { generateUUID } from './utilities.js';
/**
 * Represents a port in a graph.
 */

// import { generateUUID, EventEmitter } from './utilities.js';

class Port {
    /**
     * Creates a new Port object.
     * @param {string} id - The ID of the port.
     * @param {Node} parentNode - The node that the port belongs to.
     * @param {boolean} isConnected - Whether the port is connected to an edge.
     */
    constructor(id = generateUUID(), parentNode, eventEmitter) {
        this.id = id;
        this.parentNode = parentNode;
        this.isConnected = false;
        this.eventEmitter = eventEmitter;

        this.eventEmitter.fire('portCreated', this);
        this.eventEmitter.on('edgeCreated', this.handleEdgeCreated.bind(this));
        this.eventEmitter.on('edgeDeleted', this.handleEdgeDeleted.bind(this));
    }

    /**
     * Returns all the edges connected to or from the port.
     * @returns {Edge[]} An array containing all the edges connected to or from the port.
     */
    getPortEdges() {
        return Object.values(this.parentNode.parentGraph.edges).filter(edge => edge.fromPort === this || edge.toPort === this);
    }

    /**
     * Deletes a port from the node.
     * @throws {Error} An error is thrown if the port is an input port.
    */
    deletePort() {
        if (this.constructor.name === 'InputPort') {
            throw new Error('Input ports cannot be deleted.');
        }

        this.eventEmitter.fire('portDeleted', this);
        this.parentNode.ports.outputPorts = this.parentNode.ports.outputPorts.filter(port => port !== this);

        // delete all edges connected to this port
        const edges = this.getPortEdges();
        edges.forEach(edge => edge.deleteEdge());
    }

    /**
     * Updates the port's label.
     * @param {string} label - The new label of the port.
     * @throws {Error} An error is thrown if the port is an input port.
     * @throws {Error} An error is thrown if the label is not a string.
     */
    updateLabel(label) {
        if (this.constructor.name === 'InputPort') {
            throw new Error('Input ports cannot be updated.');
        }

        if (typeof label !== 'string') {
            throw new Error('Label must be a string.');
        }

        this.parentNode.parentGraph.eventEmitter.fire('portLabelChanged', { port: this, label: label });
    }

    /**
     * Export the port to a JSON object without circular references.
     * @returns {JSON} A JSON object representation of the port.
     */
    exportJSON() {
        return {
            id: this.id,
            parentNodeId: this.parentNode.id,
            isConnected: this.isConnected
        };
    }

    /**
     * Imports a port from a JSON object.
     * @param {JSON} json - The JSON object to import.
     * @param {Node} parentNodeId - The nodeId that the port belongs to.
     * @param {EventEmitter} eventEmitter - The event emitter for the graph.
     * @returns {Port} The imported port.
     * @static
     */
    static importJSON(json, parentNodeId, eventEmitter) {
        const parentNode = null; // TODO: get the parent node from the parentNodeId
        const port = new this(json.id, parentNode, eventEmitter);
        port.isConnected = json.isConnected;
        return port;
    }
}

/**
 * Represents an input port in a graph.
 */
class InputPort extends Port {
    /**
     * Creates a new InputPort object.
     * @param {string} id - The ID of the input port.
     */
    constructor(id = generateUUID(), parentNode, eventEmitter) {
        super(id, parentNode, eventEmitter);

    }

    handleEdgeCreated(edge) {
        if (edge.toPort === this) {
            this.isConnected = true;
        }
    }

    handleEdgeDeleted(event) {
        if (event.edge.toPort === this) {
            // check if there are any other edges connected to this port, then set isConnected accordingly
            const edges = this.getPortEdges();
            if (edges.length === 0) {
                this.isConnected = false;
            }
        }
    }
}

/**
 * Represents an output port in a graph.
 */
class OutputPort extends Port {
    /**
     * Creates a new OutputPort object.
     * @param {string} id - The ID of the output port.
     */
    constructor(id = generateUUID(), parentNode, eventEmitter) {
        super(id, parentNode, eventEmitter);
    }

    handleEdgeCreated(edge) {
        if (edge.fromPort === this) {
            this.isConnected = true;
        }
    }

    handleEdgeDeleted(event) {
        if (event.edge.fromPort === this) {
            this.isConnected = false;
        }
    }
}

export { InputPort, OutputPort };