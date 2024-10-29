import Graph from './Graph.js';
import Node from './Node.js';
import Edge from './Edge.js';

import { EventEmitter } from './utilities.js';
const ee = new EventEmitter();
let graph = new Graph(ee);
let trigger = graph.createNode('Trigger', 'Trigger');
let buttons = graph.createNode('Buttons', 'Buttons');
let close = graph.createNode('Close', 'Close');

trigger.addOutputPort(graph.createOutputPort());

buttons.addInputPort(graph.createInputPort());
buttons.addOutputPort(graph.createOutputPort());
buttons.addOutputPort(graph.createOutputPort());

close.addInputPort(graph.createInputPort());

console.assert(trigger.ports.outputPorts[0].isConnected === false);
console.assert(buttons.ports.inputPort.isConnected === false);
console.assert(buttons.ports.outputPorts[0].isConnected === false);
console.assert(buttons.ports.outputPorts[1].isConnected === false);
console.assert(close.ports.inputPort.isConnected === false);

graph.createEdge(null, trigger.ports.outputPorts[0], buttons.ports.inputPort);
console.assert(trigger.ports.outputPorts[0].isConnected === true);
console.assert(buttons.ports.inputPort.isConnected === true);
console.assert(buttons.ports.outputPorts[0].isConnected === false);
console.assert(buttons.ports.outputPorts[1].isConnected === false);
console.assert(close.ports.inputPort.isConnected === false);

graph.createEdge(null, buttons.ports.outputPorts[0], close.ports.inputPort);
console.assert(trigger.ports.outputPorts[0].isConnected === true);
console.assert(buttons.ports.inputPort.isConnected === true);
console.assert(buttons.ports.outputPorts[0].isConnected === true);
console.assert(buttons.ports.outputPorts[1].isConnected === false);
console.assert(close.ports.inputPort.isConnected === true);

graph.createEdge(null, buttons.ports.outputPorts[1], close.ports.inputPort);
console.assert(trigger.ports.outputPorts[0].isConnected === true);
console.assert(buttons.ports.inputPort.isConnected === true);
console.assert(buttons.ports.outputPorts[0].isConnected === true);
console.assert(buttons.ports.outputPorts[1].isConnected === true);
console.assert(close.ports.inputPort.isConnected === true);

// ancestor
console.assert(buttons.getNodesInPath('up').length === 1);
console.assert(buttons.getNodesInPath('up')[0] === trigger);
console.assert(close.getNodesInPath('up').length === 2);

// delete an edge
close.ports.inputPort.getPortEdges()[0].deleteEdge();
console.assert(trigger.ports.outputPorts[0].isConnected === true);
console.assert(buttons.ports.inputPort.isConnected === true);
console.assert(buttons.ports.outputPorts[0].isConnected === false);
console.assert(buttons.ports.outputPorts[1].isConnected === true);
console.assert(close.ports.inputPort.isConnected === true);

// delete a port
console.assert(buttons.ports.outputPorts[1].getPortEdges().length === 1);
buttons.ports.outputPorts[1].deletePort();
console.assert(trigger.ports.outputPorts[0].isConnected === true);
console.assert(buttons.ports.inputPort.isConnected === true);
console.assert(buttons.ports.outputPorts[0].isConnected === false);
console.assert(buttons.ports.outputPorts.length === 1);
console.assert(close.ports.inputPort.isConnected === false);
console.assert(buttons.ports.outputPorts[1] === undefined);
console.assert(close.getNodesInPath('up').length === 0);


// delete close input port
console.assert(close.ports.inputPort);
try {
    close.ports.inputPort.deletePort();
} catch (error) {
    console.assert(error.message === 'Input ports cannot be deleted.');
    console.assert(close.ports.inputPort);
}

// reordering ports
buttons.addOutputPort(graph.createOutputPort());
buttons.addOutputPort(graph.createOutputPort());
buttons.addOutputPort(graph.createOutputPort());
buttons.addOutputPort(graph.createOutputPort());

let port1 = buttons.ports.outputPorts[0];
let port2 = buttons.ports.outputPorts[1];
let port3 = buttons.ports.outputPorts[2];

console.assert(buttons.ports.outputPorts.length === 5);
console.assert(buttons.ports.outputPorts[0] === port1);
console.assert(buttons.ports.outputPorts[1] === port2);
console.assert(buttons.ports.outputPorts[2] === port3);

buttons.reorderOutputPort(0, 4);
console.assert(buttons.ports.outputPorts.length === 5);
console.assert(buttons.ports.outputPorts[4] === port1);
console.assert(buttons.ports.outputPorts[0] === port2);
console.assert(buttons.ports.outputPorts[1] === port3);

console.assert(buttons.getNodesInPath('up').length === 1);
console.assert(buttons.getNodesInPath('up')[0] === trigger);
console.assert(close.getNodesInPath('up').length === 0);

graph.createEdge(null, buttons.ports.outputPorts[1], close.ports.inputPort);
graph.createEdge(null, buttons.ports.outputPorts[2], close.ports.inputPort);
graph.createEdge(null, buttons.ports.outputPorts[3], close.ports.inputPort);

// descendants

console.assert(trigger.getNodesInPath('down').length === 2);
console.assert(buttons.getNodesInPath('down').length === 1);
console.assert(buttons.getNodesInPath('up').length === 1);
console.assert(close.getNodesInPath('down').length === 0);
console.assert(close.getNodesInPath('up').length === 2);

// create a new graph and add one parent node
let graph2 = new Graph(ee);

let eventFiredPayload = '';
graph2.eventEmitter.on('nodeParentChanged', (node) => {
    eventFiredPayload = 'nodeParentChanged' + node.id;
});

let parent = graph2.createNode('Trigger', 'Trigger', 'Trigger');
// add 2 output ports to the parent node
parent.addOutputPort(graph2.createOutputPort());
parent.addOutputPort(graph2.createOutputPort());

// create two children nodes and connect them to the parent node
let child1 = graph2.createNode('Child1', 'Child1');
child1.addInputPort(graph2.createInputPort());
child1.addOutputPort(graph2.createOutputPort());

let child2 = graph2.createNode('Child2', 'Child2');
child2.addInputPort(graph2.createInputPort());
child2.addOutputPort(graph2.createOutputPort());

// connect the parent node to the children nodes
graph2.createEdge(null, parent.ports.outputPorts[0], child1.ports.inputPort);
graph2.createEdge(null, parent.ports.outputPorts[1], child2.ports.inputPort);

// create a new node and connect it to the two children nodes
let child3 = graph2.createNode('Child3', 'Child3');
child3.addInputPort(graph2.createInputPort());
child3.addOutputPort(graph2.createOutputPort());

graph2.createEdge(null, child1.ports.outputPorts[0], child3.ports.inputPort);
graph2.createEdge(null, child2.ports.outputPorts[0], child3.ports.inputPort);

// log child3 parent node
console.assert(child3.getParentNode().id === child1.id);

console.assert(eventFiredPayload === '');

// delete child1 output port
child1.ports.outputPorts[0].deletePort();

console.assert(eventFiredPayload === 'nodeParentChanged' + child3.id);

eventFiredPayload = '';

// log child3 parent node
console.assert(child3.getParentNode().id === child2.id);

child2.ports.outputPorts[0].deletePort();
console.assert(eventFiredPayload === 'nodeParentChanged' + child3.id);
console.assert(child3.getParentNode()?.id == undefined);

// log exported graph
let importedGraph = Graph.importJSON(graph2.exportJSON());

Object.compare = function (obj1, obj2) {
	//Loop through properties in object 1
	for (var p in obj1) {
		//Check property exists on both objects
		if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;
 
		switch (typeof (obj1[p])) {
			//Deep compare objects
			case 'object':
				if (!Object.compare(obj1[p], obj2[p])) return false;
				break;
			//Compare function code
			case 'function':
				if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
				break;
			//Compare values
			default:
				if (obj1[p] != obj2[p]) return false;
		}
	}
 
	//Check object 2 for any extra properties
	for (var p in obj2) {
		if (typeof (obj1[p]) == 'undefined') return false;
	}
	return true;
};

console.assert(Object.compare(JSON.stringify(graph2.exportJSON()), JSON.stringify(importedGraph.exportJSON())));
console.log('All Graph tests passed!');