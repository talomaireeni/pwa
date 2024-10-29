// Description: Unit tests for Flow.js

import { generateUUID, EventEmitter } from './utilities.js';
import Graph from './Graph.js';
import Flow from './Flow.js';

// helper function to compare two objects
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


// create an empty flow
let flow = new Flow(generateUUID(), 'Flow', 'Description', 'Draft', 'Active', new Graph(new EventEmitter()), {});
console.assert(flow.id !== undefined);
console.log(flow);
console.assert(flow.eventEmitter instanceof EventEmitter);

// export the flow to JSON
let exportedFlowJSON = flow.exportJSON();
console.assert(exportedFlowJSON.id === flow.id);
console.assert(exportedFlowJSON.name === flow.name);
console.assert(exportedFlowJSON.description === flow.description);
console.assert(exportedFlowJSON.stage === flow.stage);
console.assert(exportedFlowJSON.state === flow.state);
console.assert(exportedFlowJSON.graph !== undefined);
console.assert(exportedFlowJSON.details !== undefined);

// import the flow from JSON
let importedFlow = Flow.importJSON(exportedFlowJSON);
console.assert(importedFlow.id === flow.id);
console.assert(importedFlow.name === flow.name);
console.assert(importedFlow.description === flow.description);
console.assert(importedFlow.stage === flow.stage);
console.assert(importedFlow.state === flow.state);
console.assert(importedFlow.graph !== undefined);
console.assert(importedFlow.details !== undefined);
console.assert(Object.compare(importedFlow, flow));

/* listen to the following events:
- 'graphCreated'
- 'nodeCreated'
- 'nodeUpdated'
- 'nodeDeleted'
- 'nodeParentChanged'
- 'portCreated'
- 'portDeleted'
- 'inputPortAddedToNode'
- 'outputPortAddedToNode'
- 'outputPortReordered'
- 'edgeCreated'
- 'edgeDeleted'
*/

flow.eventEmitter.on('graphCreated', (graph) => {
	console.log('graphCreated');
});

flow.eventEmitter.on('nodeCreated', (node) => {
	console.log('nodeCreated: '+ node.id);
});

flow.eventEmitter.on('nodeUpdated', (node) => {
	console.log('nodeUpdated: '+ node.id);
});

flow.eventEmitter.on('nodeDeleted', (node) => {});

flow.eventEmitter.on('nodeParentChanged', (node) => {});

flow.eventEmitter.on('portCreated', (port) => {});

flow.eventEmitter.on('portDeleted', (port) => {});

flow.eventEmitter.on('inputPortAddedToNode', (node) => {});

flow.eventEmitter.on('outputPortAddedToNode', (node) => {});

flow.eventEmitter.on('outputPortReordered', (node) => {});

flow.eventEmitter.on('edgeCreated', (edge) => {});

flow.eventEmitter.on('edgeDeleted', (edge) => {});



/* Add the following nodes to the graph:
- Trigger: id = 'Trigger', name = 'Trigger', type = 'Trigger', with no input port and one output port
- Buttons: id = 'Buttons', name = 'Buttons', type = 'Buttons', with one input port and two output port
- Hand-off: id = 'Hand-off', name = 'Hand-off', type = 'Hand-off', with one input port and no output port
- End: id = 'End', name = 'End', type = 'End', with one input port and no output port
*/
let triggerNode = flow.graph.createNode('Trigger', 'Trigger', 'Trigger');
triggerNode.addOutputPort(flow.graph.createOutputPort());

let buttonsNode = flow.graph.createNode('Buttons', 'Buttons', 'Buttons');
buttonsNode.addInputPort(flow.graph.createInputPort());
buttonsNode.addOutputPort(flow.graph.createOutputPort());
buttonsNode.addOutputPort(flow.graph.createOutputPort());

let handOffNode = flow.graph.createNode('Hand-off', 'Hand-off', 'Hand-off');
handOffNode.addInputPort(flow.graph.createInputPort());

let endNode = flow.graph.createNode('End', 'End', 'End');
endNode.addInputPort(flow.graph.createInputPort());

/* Add the following edges to the graph:
- Trigger -> Buttons: fromPort = triggerNode.ports.outputPorts[0], toPort = buttonsNode.ports.inputPort
- Buttons -> Hand-off: fromPort = buttonsNode.ports.outputPorts[0], toPort = handOffNode.ports.inputPort
- Buttons -> End: fromPort = buttonsNode.ports.outputPorts[1], toPort = endNode.ports.inputPort
*/

flow.graph.createEdge(generateUUID(), triggerNode.ports.outputPorts[0], buttonsNode.ports.inputPort);
flow.graph.createEdge(generateUUID(), buttonsNode.ports.outputPorts[0], handOffNode.ports.inputPort);
flow.graph.createEdge(generateUUID(), buttonsNode.ports.outputPorts[1], endNode.ports.inputPort);

// update the trigger node
triggerNode.name = 'Trigger 2';
console.log(triggerNode);
flow.graph.updateNode(triggerNode);

console.log('All Flow tests passed!');