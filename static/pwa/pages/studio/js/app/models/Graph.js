import Node from './Node.js';
import { InputPort, OutputPort } from './Port.js';
import Edge from './Edge.js';
import { generateUUID, EventEmitter } from './utilities.js';

/**
 * Represents a graph data structure that contains nodes and edges.
 */
class Graph {
    /**
     * Creates a new Graph object.
     */
    constructor(ee = new EventEmitter()) {
        this.nodes = {};
        this.edges = {};
        this.eventEmitter = ee;
        this.eventEmitter.fire('graphCreated', this);
    }

    /**
     * Exports the graph to a JSON object without circular references.
     * @returns {JSON} The exported JSON object.
     */
    exportJSON() {
        return {
            nodes: Object.values(this.nodes).map(node => node.exportJSON()),
            edges: Object.values(this.edges).map(edge => edge.exportJSON())
        }
    }

    /**
     * Imports a graph from a JSON object.
     * @param {JSON} exportedGraphJSON - The JSON object to import.
     * @returns {Graph} The imported graph.
     * @static
     */
    static importJSON(exportedGraphJSON) {
        let graph = new Graph(new EventEmitter());
        graph.nodes = exportedGraphJSON.nodes;
        graph.edges = exportedGraphJSON.edges;

        // import all nodes
        let importedNodes = {};
        let importedEdges = {};

        graph.nodes.forEach(node => {
            importedNodes[node.id] = Node.importJSON(node, graph);
        });

        graph.edges.forEach(edge => {
            importedEdges[edge.id] = Edge.importJSON(edge.id, edge.fromPortId, edge.toPortId, importedNodes);
        });

        graph.nodes = importedNodes;
        graph.edges = importedEdges;

        return graph;
    }

    /**
     * Creates a new node to the graph.
     * @param {string} id - The ID of the node.
     * @param {string} name - The name of the node.
     * @param {string} type - The type of the node.
     * return {Node} The node with the specified ID.
     */
    createNode(id = generateUUID(), name, type, parentGraph = this) {
        if (id === null) id = generateUUID();
        this.nodes[id] = new Node(id, name, type, parentGraph);
        return this.nodes[id];
    }

    /**
     * Updates an existing node in the graph.
     * @param {Node} newNode - The new node to update.
     */
    updateNode(newNode) {
        const id = newNode.id;
        this.nodes[id] = newNode;
        this.eventEmitter.fire('nodeUpdated', this.nodes[id]);
    }

    /**
     * Creates a new input port.
     * @param {string} id - The ID of the input port.
     * @returns {InputPort} The input port with the specified ID.
     */
    createInputPort(id = generateUUID()) {
        return new InputPort(id, null, this.eventEmitter);
    }

    /**
     * Creates a new output port.
     * @param {string} id - The ID of the output port.
     * @returns {OutputPort} The output port with the specified ID.
     */
    createOutputPort(id = generateUUID()) {
        return new OutputPort(id, null, this.eventEmitter);
    }

    /**
     * Creates a new edge to the graph.
     * @param {string} id - The ID of the edge.
     * @param {Port} fromPort - The port that the edge starts from.
     * @param {Port} toPort - The port that the edge ends at.
     * @returns {Edge} The edge with the specified ID.
     */
    createEdge(id = null, fromPort, toPort) {
        if (id === null) id = generateUUID();
        this.edges[id] = new Edge(id, fromPort, toPort, null);
        return this.edges[id];
    }
}

export default Graph;