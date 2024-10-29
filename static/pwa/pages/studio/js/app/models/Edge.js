import { InputPort, OutputPort } from "./Port.js";
/**
 * Represents an edge in a graph.
 */
class Edge {
    /**
     * Creates a new Edge object.
     * @param {string} id - The ID of the edge.
     * @param {Port} fromPort - The port that the edge starts from.
     * @param {Port} toPort - The port that the edge ends at.
     * @throws {Error} If fromPort is not an OutputPort.
     * @throws {Error} If toPort is not an InputPort.
     * @throws {Error} If fromPort is already connected to another edge.
     * @throws {Error} If fromPort and toPort have the same parent node.
     */
    constructor(id, fromPort, toPort) {
        // check if fromPort is an instance of OutputPort and toPort is an instance of InputPort
        if (!(fromPort instanceof OutputPort) || !(toPort instanceof InputPort)) {
            throw new Error('An edge must start from an output port and end at an input port.');

        }
        else if (fromPort.isConnected) {
            throw new Error('An output port cannot have more than one edge connected to it.');
        }
        else if (fromPort.parentNode === toPort.parentNode) {
            throw new Error('An edge cannot connect ports on the same node.');
        }

        this.id = id;
        this.fromPort = fromPort;
        this.toPort = toPort;
        this.fromPort.parentNode.parentGraph.eventEmitter.fire('edgeCreated', this);
    }

    /**
     * Deletes an Edge object from an object {} of edges in the graph.
     */
    deleteEdge() {
        let previousDistinationNodeId = this.toPort.parentNode.getParentNode().id;
        delete this.fromPort.parentNode.parentGraph.edges[this.id];
        this.fromPort.parentNode.parentGraph.eventEmitter.fire('edgeDeleted', { edge: this, previousDistinationNodeId: previousDistinationNodeId });
    }

    /**
     * Export the edge to a JSON object without circular references.
     * @returns {JSON} A JSON object representation of the edge.
     */
    exportJSON() {
        return {
            id: this.id,
            fromPortId: this.fromPort.id,
            toPortId: this.toPort.id
        };
    }

    /**
     * Imports an edge from a JSON object.
     * @param {String} fromPortId - The id of the OutputPort that the edge starts from.
     * @param {String} toPortId - The id of the InputPort that the edge ends at.
     * @param {Object} importedNodes - An object {} containing all the imported nodes.
     * @returns {Edge} The imported edge.
     */
    static importJSON(id, fromPorId, toPortId, importedNodes) {
        // find the fromPort and toPort in importedNodes
        let fromPort = null;
        let toPort = null;

        Object.values(importedNodes).forEach(node => {
            node.ports.outputPorts.forEach(port => {
                if (port.id === fromPorId) {
                    fromPort = port;
                }
            });
            node.ports?.inputPort?.id === toPortId ? toPort = node.ports.inputPort : null;
        });

        // create the edge
        return new Edge(id, fromPort, toPort);
    }
}

export default Edge;