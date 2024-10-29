/**
 * Canvas class
 * Description: This class is responsible for rendering the canvas and all the nodes on it.
 * The canvas receives a Flow object and renders it.
 * It also receives events from the Flow object and updates the canvas accordingly.
 * All rendering is done using jQuery.
 */

import { InputPort, OutputPort } from '../models/Port.js';
import Edge from '../models/Edge.js';
import { EventEmitter } from '../models/utilities.js';
import { FLOW_CONTROL_NODES, WHATSAPP_NODES, DATA_MANAGEMENT_NODES } from '../nodesDefinitions.js';
import NodeDetailsController from './NodeDetailsManager/NodeDetailsController.js';
/**
 * Canvas class
 * Description: This class is responsible for rendering the canvas and all the nodes on it.
 * The canvas receives a Flow object and renders it.
 * It also receives events from the Flow object and updates the canvas accordingly.
 * All rendering is done using jQuery.
 * @class
 * @property {Flow} flow - The flow to render.
 * @property {string} elementId - The ID of the canvas element.
 * @property {jQuery} nodesContainerElement - The container element that contains all the nodes.
 * @property {jQuery} connectionsContainerElement - The container element that contains all the connections.
 * @property {jQuery} orphanNodesContainerElement - The container element for orphan nodes
 * @property {Date} lastRenderTS - last time the canvas was rendered
 */

const nodeTypes = [...FLOW_CONTROL_NODES, ...WHATSAPP_NODES, ...DATA_MANAGEMENT_NODES];
class Canvas {
  constructor(flow) {
    this.flow = flow;
    this.nodeDetailsManager = new NodeDetailsController(this.flow);
    this.elementId = 'hudhud-studio-canvas';
    this.nodesContainerElement = $();
    this.connectionsContainerElement = $();
    this.orphanNodesContainerElement = $();
    this.lastRenderTS = 0;

    // listen to the following events:
    // - nodeDeleted
    // - nodeDetailsSet
    // - portDeleted
    // - edgeDeleted
    // - nodeParentChanged

    const reRenderEvents = [
      EventEmitter.nodeDeleted,
      EventEmitter.nodeDetailsSet,
      EventEmitter.portDeleted,
      EventEmitter.edgeDeleted,
      EventEmitter.nodeParentChanged,
    ];

    this.flow.graph.eventEmitter.on(reRenderEvents, (e, a) => {
      setTimeout(() => {
        this.renderFlow();
      }, 10);

    });

    // listen to window resize
    ['resize'].forEach(event => {
      window.addEventListener(event, (e) => {
        setTimeout(() => {
          this.renderFlow();
        }, 10);
      })
    })
  };

  /**
   * Renders the Flow and all the nodes & edges inside it.
   * If the canvas is already rendered, it will be cleared and re-rendered.
   * @throws {Error} - If the Flow is empty.
   * @throws {Error} - If the there is no trigger node.
   * @returns {void}
   */
  renderFlow() {

    // if the flow was already rendered less than 50 ms ago, exist
    if (new Date().getTime() - this.lastRenderTS <= 50)
      return;
    else
      this.lastRenderTS = new Date().getTime();

    if (Object.values(this.flow.graph.nodes).length === 0) {
      throw new Error('Cannot render an empty Flow');
    }

    if (!Object.values(this.flow.graph.nodes).some((node) => node.type === 'Trigger')) {
      throw new Error('Cannot render a Flow without a trigger node');
    }

    // clear the canvas
    this.clearCanvas();

    // render find the trigger node from graph.nodes object
    let triggerNode = Object.values(this.flow.graph.nodes).find((node) => node.type === 'Trigger');

    // if the container element is not created yet, create it
    if (this.nodesContainerElement.length === 0) {
      this.nodesContainerElement = $(/*html*/`<div id="${this.elementId}" class="canvas-container"></div>`);
      this.connectionsContainerElement = $(/*html*/`
      <div id="hudhud-svg-container">
        <svg id="hudhud-connections-container" height="0" width="0" style="position:absolute;top:0px;left:0px;z-index:0">
        </svg>
      </div>`);

      $('.canvas-app')
        .append(this.nodesContainerElement)
        .append(this.connectionsContainerElement);
    }

    if ($(`#${this.elementId}-orphan-nodes`).length === 0) {
      this.orphanNodesContainerElement = $(/*html*/`<div id="${this.elementId}-orphan-nodes"></div>`);
      $('.canvas-app').append(this.orphanNodesContainerElement);
      this.orphanNodesContainerElement = $('#' + this.elementId + '-orphan-nodes');
    }

    // render the trigger node, this will recursively render all connected nodes
    this.renderTriggerNode(triggerNode);

    /* get all shortcut nodes
    */

    // get all edges
    const edges = Object.values(this.flow.graph.edges);
    edges.forEach((edge) => {
      const fromNode = edge.fromPort.parentNode;
      const toNode = edge.toPort.parentNode;

      // check if there is an edge connecting to the toNode
      const edgesConnectingToToNode = edges.filter((e) => e.toPort.parentNode === toNode);
      if (edgesConnectingToToNode.length > 1) {
        // get the index of the current edge in the edgesConnectingToToNode array
        const index = edgesConnectingToToNode.indexOf(edge);

        // if the index is > 0, then this edge is a shortcut edge
        if (index > 0) {
          // render the shortcut node only if the parent node is not collapsed
          if (this.nodesContainerElement.find(`#${toNode.id}`).length >= 0
            && !this.flow.details.nodes[fromNode.id]?.collapsed) {
            this.renderNodeShortcut(toNode, edge.fromPort);
          }

          this.flow.setEdgeDetails(edge.id, {
            shortcut: true,
            shortcutToNodeId: toNode.id,
            shortcutFromPortId: edge.fromPort.id,
          });
        }
        else {
          this.flow.setEdgeDetails(edge.id, { shortcut: false });
        }
      }
    });

    // get all nodes that have an unconnected input port
    const orphanNodes = Object.values(this.flow.graph.nodes)
      .filter((node) => node.ports.inputPort && !node.ports.inputPort.isConnected && node.type !== 'Trigger');

    // collapse all orphan nodes and render them in the orphan nodes container
    if (orphanNodes.length > 0) {
      // clear the orphan nodes container
      this.orphanNodesContainerElement.empty();

      // add h6 title
      this.orphanNodesContainerElement.append(/*html*/`
        <h6 class="orphan-nodes-title"><i class="iconoir-warning-triangle-solid"></i> Not connected nodes !</h6>
      `);

      orphanNodes.forEach((node) => {
        this.flow.setNodeDetails(node, { collapsed: true });
        this.renderOrphanNode(node);
      });
    }
    else {
      // remove the orphan nodes container
      this.orphanNodesContainerElement.remove();
    }

    // render edges
    setTimeout(() => {
      this.updateAllConnections();
    }, 10);
  }

  /**
   * Clears the canvas.
   * @returns {void}
   */
  clearCanvas() {
    this.nodesContainerElement.empty();
    this.connectionsContainerElement.empty();
    this.orphanNodesContainerElement.empty();
  }

  /**
   * Renders a node and all its children. If the node is the trigger node (fromOutputPort is null), it will be appended directly to the container element.
   * If the node is already rendered, it will be cleared and re-rendered.
   * 
   * @param {Node} node - The node to render.
   * @param {OutputPort} fromOutputPort - The output port where the node is connected to. If null, the node is the trigger node.
   * @returns {void}
   */
  renderNode(node, fromOutputPort = null) {
    // if the node is already rendered, then exit without rendering it again (to avoid infinite loop)
    if (this.nodesContainerElement.find(`#${node.id}`).length > 0) {
      return;
    }

    // get node's details from flow.details.nodes
    const details = this.flow.details.nodes[node.id];
    const inputPort = node.ports.inputPort;
    const isCollapsed = details?.collapsed || false;
    const nodeType = nodeTypes.find((n) => n.type === node.type);
    const nodeSnippet = (details?.snippet?.length > 105 ? ((details?.snippet || '').substr(0, 105) + ' ...') : details?.snippet);

    // render the node
    let nodeElement = $(/*html*/`
      <div id="${node.id}" class="node-container">
        <div class="parent-container">
          <div id="node-${node.id}" class="node" style="border-color:${nodeType?.color};">
            <div class="node-input-ports-container">
              ${inputPort?.id ? `<div id="${inputPort.id}" class="port node-input-port"></div>` : ''}
            </div>
            <div class="node-content">
              <div class="node-header">
                <span class="node-type-indicator" style="background-color:${nodeType?.color}"></span>
                <div class="node-icon">
                <i class="${nodeType?.icon}"></i>
                </div>
                <h3 class="node-title">${node.name}</h3>
              </div>
              <h4 class="node-snippet">${nodeSnippet}</h4>
            </div>
            <div class="node-footer">
              <div class="node-collapse-actions" style="${(node.getNodesInPath('down', []).length && isCollapsed ? 'color: var(--bs-dark);' : '')}">
                <div class="node-icon">
                  <i class="iconoir-nav-arrow-${(isCollapsed ? 'down' : 'up')}"></i>
                </div>
                <span class="hidden-nodes-count">
                  ${((node.getNodesInPath('down', []).length && isCollapsed) ? `Show ${node.getNodesInPath('down', []).length} hidden steps` : ``)}
                </span>
              </div>
              <div class="node-output-ports-container">
                ${node.ports.outputPorts.map((port) => `<div id="${port.id}" class="port node-output-port ${port.isConnected ? 'connected' : ''}">${port.isConnected ? '' : '<i class="iconoir-plus"></i>'}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="children-container">
          ${node.ports.outputPorts.map((port) => `<div id="${port.id}" class="dummy-child node-container"></div>`).join('')}
        </div>
      </div>
      `);

    // add double click event to the node - unless it is a Trigger node - to open the node details modal
    if (node.type !== 'Trigger') {
      nodeElement.find('.node').dblclick((e) => {
        e.stopPropagation();

        // get node id
        const nodeId = $(e.target).closest('.node-container').attr('id');

        // open the node details modal
        this.showNodeEditModal(nodeId);
      });
    }

    // add click event to the output ports
    nodeElement.find('.node-output-port i').click((e) => {
      e.stopPropagation();
      if (!$(e.target).parent().hasClass('connected')) {
        let fromNodeId = $(e.target).closest('.node-container').attr('id');
        let fromPortId = $(e.target).parent().attr('id');
        // createNewNode(fromNodeId, fromPortId);
        this.renderCreateNodeModal(fromNodeId, fromPortId);
      }
    });

    // add popover to the output ports
    nodeElement.find('.node-output-port').each((index, port) => {
      const portLabel = this.flow.details.ports[port.id]?.label || '';
      const popover = new bootstrap.Popover(port, {
        container: 'body',
        html: false,
        content: portLabel,
        placement: 'top',
        trigger: 'hover',
        sanitize: false,
        customClass: 'port-details-popover',
      });
    });

    // add click event to the collapse actions
    nodeElement.find('.node-collapse-actions').click((e) => {
      // mark this node as collapsed or not
      // get node details
      let nodeDetails = this.flow.details.nodes[node.id] || {};
      // update the object with toggle the collapsed property
      nodeDetails.collapsed = !nodeDetails?.collapsed || false;
      this.flow.setNodeDetails(node, nodeDetails);
      // re-render the flow
      this.renderFlow();
    });

    // append the node to the canvas
    if (fromOutputPort === null) {
      this.nodesContainerElement.append(nodeElement);
    }
    else {
      const fromNodeId = fromOutputPort.parentNode.id;
      const atIndex = fromOutputPort.parentNode.ports.outputPorts.indexOf(fromOutputPort);

      this.nodesContainerElement
        .find(`#${fromNodeId} > .children-container > .node-container:eq(${atIndex})`)
        .before(nodeElement);
    }

    // render the children if the node is not collapsed
    if (!isCollapsed) {
      node.ports.outputPorts.forEach((outputPort) => {
        if (outputPort.isConnected) {
          // find the first node connected to the output port from the graph edges
          const edge = Object.values(this.flow.graph.edges).find((edge) => edge.fromPort.id === outputPort.id);
          const childNode = edge.toPort.parentNode;

          // if the child node is a shortcut node, do not render it
          if (this.flow.details.edges[edge.id]?.shortcut === true) {
            return;
          }

          this.renderNode(childNode, outputPort);
        }
      });
    }
  }

  /**
   * Renders the Trigger node.
   * @param {Node} node - The node to render.
   * @returns {void}
   * @throws {Error} - If the Trigger node is not found.
   */
  renderTriggerNode(node) {

    // if the node is already rendered, then exit without rendering it again (to avoid infinite loop)
    if (this.nodesContainerElement.find(`#${node.id}`).length > 0) {
      return;
    }

    // get node's details from flow.details.nodes
    const details = this.flow.details.nodes[node.id];
    const inputPort = node.ports.inputPort;
    const isCollapsed = details?.collapsed || false;
    const nodeType = nodeTypes.find((n) => n.type === node.type);
    const nodeSnippet = (details?.snippet?.length > 105 ? ((details?.snippet || '').substr(0, 105) + ' ...') : details?.snippet);

    if (!nodeType) {
      throw new Error('Trigger node not found');
    }

    if (nodeType.type !== 'Trigger') {
      throw new Error('Node is not a Trigger node');
    }

    // render the node
    let nodeElement = $(/*html*/`
      <div id="${node.id}" class="node-container">
        <div class="parent-container">
          <div id="node-${node.id}" class="node trigger-node" style="border-color:${nodeType?.color};">
            <div class="node-content">
              <div class="node-icon">
                <i class="${nodeType?.icon}"></i>
              </div>
              <div class="node-header">
                <h3 class="node-title">${node.name}</h3>
              </div>
            </div>
            <div class="node-footer">
              <div class="node-collapse-actions" style="${(node.getNodesInPath('down', []).length && isCollapsed ? 'color: var(--bs-dark);' : '')}">
                <div class="node-icon" style="font-size: 18px;margin: 3px;">
                  <i class="iconoir-nav-arrow-${(isCollapsed ? 'down' : 'up')}"></i>
                </div>
                <span class="hidden-nodes-count">
                  ${((node.getNodesInPath('down', []).length && isCollapsed) ? `Show ${node.getNodesInPath('down', []).length} hidden steps` : ``)}
                </span>
              </div>
              <div class="node-output-ports-container">
                ${node.ports.outputPorts.map((port) => `<div id="${port.id}" class="port node-output-port ${port.isConnected ? 'connected' : ''}"></div>`).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="children-container">
          ${node.ports.outputPorts.map((port) => `<div id="${port.id}" class="dummy-child node-container"></div>`).join('')}
        </div>
      </div>
      `);


    // add click event to the output ports
    nodeElement.find('.node-output-port').click((e) => {
      e.stopPropagation();
      if (!$(e.target).hasClass('connected')) {
        let fromNodeId = $(e.target).closest('.node-container').attr('id');
        let fromPortId = $(e.target).attr('id');
        // createNewNode(fromNodeId, fromPortId);
        this.renderCreateNodeModal(fromNodeId, fromPortId);
      }
    });

    // add click event to the collapse actions
    nodeElement.find('.node-collapse-actions').click((e) => {
      // mark this node as collapsed or not
      // get node details
      let nodeDetails = this.flow.details.nodes[node.id] || {};
      // update the object with toggle the collapsed property
      nodeDetails.collapsed = !nodeDetails?.collapsed || false;
      this.flow.setNodeDetails(node, nodeDetails);
      // re-render the flow
      this.renderFlow();
    });

    // append the node to the canvas
    this.nodesContainerElement.append(nodeElement);

    // render the children if the node is not collapsed
    if (!isCollapsed) {
      node.ports.outputPorts.forEach((outputPort) => {
        if (outputPort.isConnected) {
          // find the first node connected to the output port from the graph edges
          const edge = Object.values(this.flow.graph.edges).find((edge) => edge.fromPort.id === outputPort.id);
          const childNode = edge.toPort.parentNode;
          this.renderNode(childNode, outputPort);
        }
      });
    }
  }

  /**
   * Renders a shortcut to node.
   * 
   * @param {Node} originalNode - The node to create a shortcut for.
   * @param {OutputPort} fromOutputPort - The output port where the shortcut node is connected to.
   * @returns {void}
   */
  renderNodeShortcut(originalNode, fromOutputPort) {

    let node = originalNode;

    // if the exact shortcut node is already rendered, then exit without rendering it again
    if (this.nodesContainerElement.find(`#shortcut-from-port-${fromOutputPort.id}-to-node-${node.id}`).length > 0) {
      return;
    }

    // get node's details from flow.details
    const details = this.flow.details.nodes[node.id];
    const inputPort = node.ports.inputPort;
    const isCollapsed = details?.collapsed || false;

    // render the node
    let nodeElement = $(/*html*/`
      <div id="shortcut-from-port-${fromOutputPort.id}-to-node-${node.id}" class="node-container">
        <div class="parent-container">
          <div id="node-${node.id}" class="node shortcut-node">
            <div class="node-input-ports-container">
              ${inputPort?.id ? `<div id="shortcut-from-${fromOutputPort.id}-to-${inputPort.id}" class="port node-input-port"></div>` : ''}
            </div>
            <div class="node-content">
              <div class="node-header">
                <span class="node-type-indicator"></span>
                <div class="node-icon">
                <i class="iconoir-arrow-up-right-square"></i>
                </div>
                <h3 class="node-title">Shortcut</h3>
              </div>
              <h4 class="node-snippet">Go to: <span class="node-link">${node.name}</span></h4>
            </div>
          </div>
        </div>
        <div class="children-container">
          ${node.ports.outputPorts.map((port) => `<div id="${port.id}" class="dummy-child node-container"></div>`).join('')}
        </div>
      </div>
      `);

    // add click event to .shortcut-node
    nodeElement.find('.shortcut-node').click((e) => {
      e.stopPropagation();
      // get node id
      let orignalNodeId = $(e.target).closest('.node-container').attr('id');
      orignalNodeId = orignalNodeId.substring(orignalNodeId.indexOf('-to-node-') + '-to-node-'.length);

      // if the orignalNode is not rendered, then expand all its parents and scroll to it
      if (this.nodesContainerElement.find(`#${orignalNodeId}`).length === 0) {
        // expand all parents
        const ancestors = this.flow.graph.nodes[orignalNodeId].getNodesInPath('up', []);
        ancestors.forEach((ancestor) => {
          this.flow.setNodeDetails(ancestor, { collapsed: false });
        });
        // re-render the flow
        // this.renderNode(childNode, outputPort);
        this.renderFlow();
        setTimeout(() => {
          this.scrollToNode(this.flow.graph.nodes[orignalNodeId]);
        }, 800);

      }
      else {
        this.scrollToNode(this.flow.graph.nodes[orignalNodeId]);
      }

    });


    const fromNodeId = fromOutputPort.parentNode.id;
    const atIndex = fromOutputPort.parentNode.ports.outputPorts.indexOf(fromOutputPort);

    this.nodesContainerElement.find(`#${fromNodeId} > .children-container > .node-container:eq(${atIndex})`)
      .before(nodeElement);
  }

  /**
    * Renders an orphan.
    * 
    * @param {Node} originalNode - The orphan node to render.
    * @param {OutputPort} fromOutputPort - The output port where the orphan node is connected to.
    * @returns {void}
    */
  renderOrphanNode(node) {

    // if the node is already rendered, then exit without rendering it again
    if (this.nodesContainerElement.find(`#${node.id}`).length > 0) {
      return;
    }

    // get node's details from flow.details
    const details = this.flow.details.nodes[node.id];
    const inputPort = node.ports.inputPort;
    const isCollapsed = details?.collapsed || false;
    const nodeType = nodeTypes.find((nodeType) => nodeType.type === node.type);
    const nodeSnippet = (details?.snippet?.length > 105 ? ((details?.snippet || '').substr(0, 105) + ' ...') : details?.snippet);

    // render the node
    let nodeElement = $(/*html*/`
      <div id="${node.id}" class="node-container">
        <div class="parent-container">
          <div id="node-${node.id}" class="node" style="border-color:${nodeType?.color};">
            <div class="node-input-ports-container">
              ${inputPort?.id ? `<div id="${inputPort.id}" class="port node-input-port"></div>` : ''}
            </div>
            <div class="node-content">
              <div class="node-header">
                <span class="node-type-indicator" style="background-color:${nodeType?.color}"></span>
                <div class="node-icon">
                <i class="${nodeType?.icon}"></i>
                </div>
                <h3 class="node-title">${node.name}</h3>
                <div class="node-icon">
                <i class="iconoir-warning-triangle"></i>
                </div>
              </div>
              <h4 class="node-snippet">${nodeSnippet}</h4>
            </div>
            <div class="node-footer">
              <div class="node-collapse-actions" style="${(node.getNodesInPath('down', []).length && isCollapsed ? 'color: var(--bs-dark);' : '')}">
                <div class="node-icon">
                  <i class="iconoir-nav-arrow-${(isCollapsed ? 'down' : 'up')}"></i>
                </div>
                <span class="hidden-nodes-count">
                  ${((node.getNodesInPath('down', []).length && isCollapsed) ? `Show ${node.getNodesInPath('down', []).length} hidden steps` : ``)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    // add double click event to the node - unless it is a Trigger node - to open the node details modal
    if (node.type !== 'Trigger') {
      nodeElement.find('.node').dblclick((e) => {
        e.stopPropagation();

        // get node id
        const nodeId = $(e.target).closest('.node-container').attr('id');

        // open the node details modal
        this.showNodeEditModal(nodeId);
      });
    }


    this.orphanNodesContainerElement.append(nodeElement);
  }

  /**
   * Scroll to & highlights a node.
   * @param {Node} node - The node to scroll to.
   * Throws an error if the node is not rendered.
   * @returns {Path} - The path element of the edge.
   */
  scrollToNode(node) {
    if (this.nodesContainerElement.find(`#${node.id}`).length === 0 && this.orphanNodesContainerElement.find(`#${node.id}`).length === 0) {
      throw new Error('Cannot scroll to a node that is not rendered');
    }

    const elementSource = (this.nodesContainerElement.find(`#${node.id}`).length > 0 ? this.nodesContainerElement : this.orphanNodesContainerElement);

    const nodeElement = elementSource.find(`#${node.id} .parent-container`)[0];
    nodeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    // highlight the node temporarily using jQuery
    $(nodeElement)
      .addClass('node-highlighted')
      .addClass('shake-horizontal');
    setTimeout(() => {
      $(nodeElement)
        .removeClass('node-highlighted')
        .removeClass('shake-horizontal');
    }, 1200);

  }

  /**
   * Renders an edge between two ports.
   * @param {Edge} edge - The edge to render.
   * @returns {Path} - The path element of the edge.
   * @throws {Error} - If the ports are not connected.
   * @throws {Error} - If the input port's parent node is collapsed.
   */
  renderEdge(edge) {
    if (!edge.fromPort.isConnected || !edge.toPort.isConnected) {
      throw new Error('Cannot render an edge between two ports that are not connected');
    }

    if (this.flow.details.nodes[edge.fromPort.parentNode.id]?.collapsed === true) {
      throw new Error(`Cannot render an edge that is connected from the collapsed node ${edge.fromPort.parentNode.name}`);
    }

    let from = this.getOutputPortCoordinates(edge.fromPort);
    let to;

    try {
      // if edge is shortcut, then get the coordinates of the shortcut node
      if (this.flow.details.edges[edge.id]?.shortcut === true) {
        to = this.getInputPortCoordinates(edge.toPort, this.flow.details.edges[edge.id]);
      }
      else {
        to = this.getInputPortCoordinates(edge.toPort);
      }
    } catch (error) {
      console.log('Not visible port');
      console.log(edge);
      console.log({ from, to });
    }

    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    // render the edge only if the input ports' parent node is not collapsed

    if (this.flow.details.nodes[edge.fromPort.parentNode.id]?.collapsed === true) {
      // console.log(`Not rendering edge ${edge.id} because the node "${edge.toPort.parentNode.name}" is collapsed`);
    }
    else {
      let fromPortIndentation = this.getOutputPortIndentation(edge.fromPort);
      path.setAttribute("d", this.generateSVGPath(from.portX, from.portY, to.portX, to.portY, fromPortIndentation));
      path.setAttribute("id", edge.id);
      path.setAttribute("stroke", "#bbbbbb");
      path.setAttribute("stroke-width", ".85");
      path.setAttribute("fill", "none");
      path.setAttribute("style", "pointer-events:all;");

      // get the input port and the output port
      const inputPort = edge.toPort;
      const outputPort = edge.fromPort;
      // get .port divs
      const inputPortDiv = this.nodesContainerElement.find(`#${(this.flow.details.edges[edge.id]?.shortcut === true ? `shortcut-from-${edge.fromPort.id}-to-` : '')}${inputPort.id}`);
      const outputPortDiv = this.nodesContainerElement.find(`#${outputPort.id}`);

      // add click event to the path
      path.addEventListener('click', (e) => {
        e.stopPropagation();

        // render a dismissable popover with a delete button, once the delete button is clicked, change the button text to "Are you sure?" 
        const popover = new bootstrap.Popover(path, {
          container: 'body',
          html: true,
          content: /*html*/`
          <div class="edge-details">
            <div class="edge-details-body">
              <h6 class="edge-details-title text-white">
              Delete the connection from <b>"${outputPort.parentNode.name}"</b> to <b>"${inputPort.parentNode.name}"</b> ?
              </h6>
              <div class="edge-details-title">Delete connection</div>
            <button class="btn btn-sm btn-danger edge-details-delete-btn w-100" style="transition: all .4s ease-in-out">
              Delete connection
              <i class="iconoir-xmark-circle-solid"></i>
              </button>
            </div>
          `,
          placement: 'bottom',
          trigger: 'focus',
          sanitize: false,
          customClass: 'edge-details-popover',
        });

        // when clicking outside the popover, hide it
        $(document).click((e) => {
          if (!$(e.target).closest('.popover').length) {
            popover.hide();
          }
        });

        // show the popover
        popover.show();

        // add click event to the delete button using jquery
        $(popover.tip).find('.edge-details-delete-btn').click((e) => {
          e.stopPropagation();

          if ($(e.target).data('state') === 'confirm') {
            // 1. delete the edge from the graph
            this.flow.graph.edges[edge.id].deleteEdge();

            // 2. delete the edge from the details object
            delete this.flow.details.edges[edge.id];

            // 3. re-render the flow
            this.renderFlow();

            // 4. hide the popover
            popover.hide();

          }
          else {
            // change the button text to "Confirm deletion"
            $(e.target)
              .data('state', 'confirm')
              .text('Confirm deletion')
              .addClass('btn-lg')
              .removeClass('btn-sm');
          }
        });

      });

      // add hover event to the path
      path.addEventListener('mouseover', (e) => {
        e.stopPropagation();

        // highlight the path
        path.setAttribute("stroke", "#3185fc");
        path.setAttribute("stroke-width", "2px");

        // highlight the input & output ports
        inputPortDiv.addClass('highlighted');
        outputPortDiv.addClass('highlighted');
      });

      // add mouseout event to the path
      path.addEventListener('mouseout', (e) => {
        e.stopPropagation();
        // unhighlight the path
        path.setAttribute("stroke", "#bbbbbb");
        path.setAttribute("stroke-width", ".85");

        // unhighlight the input port & output ports
        inputPortDiv.removeClass('highlighted');
        outputPortDiv.removeClass('highlighted');
      });
    }

    return path;
  }

  /**
   * Returns the indentation of the output port.
   * @param {OutputPort} outputPort - The id of the output port.
   * @returns {Number} - The indentation for the output port.
   * @throws {Error} - If the port is not an output port.
   */
  getOutputPortIndentation(outputPort) {
    // if outputPort is not an OutputPort object, throw an error
    if (!(outputPort instanceof OutputPort)) {
      throw new Error('outputPort must be an OutputPort object');
    }

    // get output port index from outputPorts array, then get the output port index from the reversed outputPorts array
    let fromNode = outputPort.parentNode;
    let leftIndex = fromNode.ports.outputPorts.indexOf(outputPort);
    let rightIndex = fromNode.ports.outputPorts.toReversed().indexOf(outputPort);

    // get the max of the two indexes
    let indentation = Math.max(leftIndex, rightIndex);

    return indentation / fromNode.ports.outputPorts.length;
  }

  /**
   * Returns the coordinates of the output port.
   * @param {OutputPort} outputPort - The id of the output port.
   * @returns {Object} - The coordinates of the output port.
   * @throws {Error} - If the port is not an output port.
   */
  getOutputPortCoordinates(outputPort) {
    // if outputPort is not an OutputPort object, throw an error
    if (!(outputPort instanceof OutputPort)) {
      throw new Error('outputPort must be an OutputPort object');
    }

    let portEl = this.nodesContainerElement.find('#' + outputPort.id);
    if (portEl.hasClass('node-output-port')) {
      return { "portX": portEl.offset().left, "portY": portEl.offset().top + 2 };
    }
    else {
      return "Not a valid port";
    }
  }

  /**
   * Returns the coordinates of the input port.
   * @param {InputPort} inputPort - The id of the input port.
   * @returns {Object} - The coordinates of the input port.
   * @throws {Error} - If the port is not an input port.
   * @throws {Error} - If the port's parent node is hidden.
   */
  getInputPortCoordinates(inputPort, shortcutData = null) {
    // if inputPort is not an InputPort object, throw an error
    if (!(inputPort instanceof InputPort)) {
      throw new Error('inputPort must be an InputPort object');
    }

    // if the input port's parent node is hidden, throw an error
    if (this.flow.details.nodes[inputPort.parentNode.id]?.hidden === true) {
      throw new Error('Cannot get coordinates of an input port that is connected to a hidden node');
    }

    let portEl = this.nodesContainerElement.find('#' + inputPort.id);

    // if from shortcut node, then get the coordinates of the shortcut node
    if (shortcutData) {
      portEl = this.nodesContainerElement
        .find(`#shortcut-from-port-${shortcutData.shortcutFromPortId}-to-node-${shortcutData.shortcutToNodeId}`)
        .find(`#shortcut-from-${shortcutData.shortcutFromPortId}-to-` + inputPort.id);
    }

    if (portEl.hasClass('node-input-port')) {
      return { "portX": portEl.offset().left, "portY": portEl.offset().top - 11 };
    }
  }

  generateSVGPath(startX, startY, endX, endY, indentation = 0) {
    let d = '';
    // round all values
    startX = Math.round(startX);
    startY = Math.round(startY) + 2.5;
    endX = Math.round(endX);
    endY = Math.round(endY) - 2.5;

    const lineSplit = 0.9;
    const startSplit = lineSplit - (.9*indentation);
    const endSplit = 1 - startSplit;

    if (startX == endX) {
      d = `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    else {
      // generate path with rounded corners uding quadratic bezier curves
      if (startX > endX) {
        d = `M ${startX} ${startY}`;
        d += ` L ${startX} ${Math.floor(startY + startSplit * (endY - startY))}`;
        d += ` q 0 3 -3 3`;
        d += ` L ${endX + 3} ${Math.ceil(endY - endSplit * (endY - startY) + 2)}`;
        d += ` q -3 0 -3 3`;
        d += ` L ${endX} ${endY}`;
      }
      else {
        d = `M ${startX} ${startY}`;
        d += ` L ${startX} ${Math.floor(startY + startSplit * (endY - startY))}`;
        d += ` q 0 3 3 3`;
        d += ` L ${endX - 3} ${Math.ceil(endY - endSplit * (endY - startY) + 2)}`;
        d += ` q 3 0 3 3`;
        d += ` L ${endX} ${endY}`;
      }
    }

    return d;
  }

  updateAllConnections() {

    /** To make sure calculation are correct, we need to:
     * - save the current scroll top, scroll left, and zoom level
     * - scroll to the top left of the canvas (0,0) and reset the zoom level to 1
     * - set the height and width of the connections container to the height and width of the nodes container
     * - set the top and left of the connections container to the top and left of the nodes container
     * - render the connections
     * - scroll back to the previous scroll top and left
     * - reset the zoom level
     * */

    // save the current scroll and zoom level
    const scrollTop = $('.canvas-app').scrollTop();
    const scrollLeft = $('.canvas-app').scrollLeft();
    const zoomLevel = $('.canvas-app').css('zoom');

    // scroll to the top of the canvas
    $('.canvas-app').scrollTop(0);
    $('.canvas-app').scrollLeft(0);
    $('.canvas-app').css('zoom', 1);

    this.connectionsContainerElement.attr('height', this.nodesContainerElement.height());
    this.connectionsContainerElement.attr('width', this.nodesContainerElement.width());

    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "hudhud-connections-container");
    svg.setAttribute("height", this.nodesContainerElement.height());
    svg.setAttribute("width", this.nodesContainerElement.width());
    svg.setAttribute("style", `pointer-events: none;position:absolute;top:calc(${this.nodesContainerElement.offset().top}px - 35px);left:11px;z-index:5;`);

    Object.values(this.flow.graph.edges).forEach((edge) => {
      try {
        svg.appendChild(this.renderEdge(edge));
      } catch (error) {
        // console.log(error.message);
      }
    });

    // remove previous svg
    this.connectionsContainerElement.find('svg').remove();
    this.connectionsContainerElement.append(svg);

    // scroll back to the previous scroll top
    $('.canvas-app').scrollTop(scrollTop);
    $('.canvas-app').scrollLeft(scrollLeft);
    $('.canvas-app').css('zoom', zoomLevel);

    this.alignConnections();
  }

  /**
   * Zooms in the canvas.
   * @returns {void}
   */
  zoomIn() {
    this.zoomLevel = (this.zoomLevel ?? 1) * 1.1;
    if (this.zoomLevel > 3) {
      this.zoomLevel = 3;
    }
    $('.canvas-app').css('zoom', this.zoomLevel);

    this.updateAllConnections();
  }

  /**
   * Zooms out the canvas.
   * @returns {void}
   * 
   */
  zoomOut() {
    this.zoomLevel = (this.zoomLevel ?? 1) / 1.1;
    if (this.zoomLevel < .5) {
      this.zoomLevel = .5;
    }
    $('.canvas-app').css('zoom', this.zoomLevel);
    this.updateAllConnections();
  }

  /** Resets the zoom level to 1.
   * @returns {void}
   */
  zoomReset() {
    this.zoomLevel = 1;
    $('.canvas-app').css('zoom', this.zoomLevel);
    this.updateAllConnections();
  }

  /**
   * Align connections svg to the nodes container.
   * @returns {void}
   */
  alignConnections() {
    // get the trigger node's output port element
    const anchorElement = this.nodesContainerElement.find('.trigger-node .node-output-port');
    // get the first path element in the connections container
    const firstPath = this.connectionsContainerElement.find('svg path:first');

    if (anchorElement.length === 1 && firstPath.length === 1) {
      const correction = anchorElement.offset().left - firstPath.offset().left + 21.5;
      this.connectionsContainerElement.find('svg').css('left', `${correction}px`);
    }
  }

  /** Collapse all nodes except the Trigger node.
   * @returns {void}
   */
  collapseAll() {
    Object.values(this.flow.graph.nodes).forEach((node) => {
      if (node.type !== 'Trigger') {
        // get node details
        let nodeDetails = this.flow.details.nodes[node.id] || {};
        // update the object with toggle the collapsed property
        nodeDetails.collapsed = true;
        this.flow.setNodeDetails(node, nodeDetails);
      }
    });
    // re-render the flow
    this.renderFlow();
  }

  /** Expand all nodes.
   * @returns {void} 
   */
  expandAll() {
    Object.values(this.flow.graph.nodes).forEach((node) => {
      // get node details
      let nodeDetails = this.flow.details.nodes[node.id] || {};
      // update the object with toggle the collapsed property
      nodeDetails.collapsed = false;
      this.flow.setNodeDetails(node, nodeDetails);
    });
    // re-render the flow
    this.renderFlow();
  }

  /**
   * Renders "Create Node" modal.
   * @param {string} fromNodeId - The id of the node where the new node is connected from.
   * @param {string} fromPortId - The id of the port where the new node is connected from.
   * @throws {Error} - If the fromNodeId or fromPortId are not found.
   * @returns {void}
   */
  renderCreateNodeModal(fromNodeId, fromPortId) {
    // if fromNodeId or fromPortId are not found, throw an error
    if (!fromNodeId || !fromPortId) {
      throw new Error('fromNodeId and fromPortId are required');
    }

    // render the modal

    const gotoNode = nodeTypes.find((node) => node.name === 'Goto node');

    const nodeTypesElements =
    /*html*/`
    <div class="my-3">
        <div class="node go-to-node node-in-list" data-node-type="${gotoNode.type}">
          <div class="node-content">
            <div class="node-header">
              <div class="node-icon">
              </div>
              <h3 class="node-title">Connect to a Step</h3>
            </div>
            <h4 class="node-snippet">Click to connect to an existing node in the flow ..</h4>
          </div>
          <div class="arrow-icon">
            <i class="${gotoNode.icon}"></i>
          </div>
        </div>
    </div>
    <div class="my-4">
      <p style="color:var(--bs-gray-600)">.. or create a new step from this list:</p>
    </div>

    <div class="node-types-container">
    `
      +
      nodeTypes
        .filter((nodeType) => nodeType.name !== 'Trigger' && nodeType.name !== 'Goto node')
        .map((nodeType) => {
          return /*html*/`
      <div class="my-3">
        <div class="node node-in-list" data-node-type="${nodeType.type}">
          <div class="node-content">
            <div class="node-header">
              <span class="node-type-indicator" style="background-color: ${nodeType.color}"></span>
              <div class="node-icon">
                <i class="${nodeType.icon}"></i>
              </div>
              <h3 class="node-title">${nodeType.name}</h3>
            </div>
            <h4 class="node-snippet"></h4>
          </div>
        </div>
      </div>`;
        }).join('')
      + `</div>`;



    let modal = $(/*html*/`
    <div class="modal fade" id="create-node-modal" tabindex="-1" aria-labelledby="create-node-modal-label"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="create-node-modal-label">Select a component</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body nodes-list-container">
          ${nodeTypesElements}          
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary disabled" id="create-node-modal-create-btn">Add</button>
        </div>
      </div>
    </div>
  </div>
    `);

    // add click event to the first node in the list (goto node)
    modal.find('.node-in-list:eq(0)').click((e) => {
      e.stopPropagation();
      modal.find('.node-in-list').removeClass('selected');
      // add class 'selecting-mode' to the canvas app div
      // $('.canvas-app').addClass('selecting-mode');

      // show alert "Please choose a node to connect to"
      const alert = $(/*html*/`
      <div class="instruction" role="alert">
        <span>Choose a node to connect to</span>
        <span class="dismiss"><i class="iconoir-xmark"></i></span>
      </div>
      `);

      // add click event to dismiss the alert
      alert.find('.dismiss').click((e) => {
        e.stopPropagation();
        alert.remove();
      });

      // if the alert is not rendered yet, render it and add it to the body
      if ($('.canvas-app').find('.alert').length === 0) {
        $('.canvas-app').append(alert);
      }

      // hide the modal
      modal.modal('hide');

      // listen to mouseover event on all nodes except: 1. the from node, 2. Trigger node & 3. shortcut nodes
      const triggerNode = Object.values(this.flow.graph.nodes).find((node) => node.type === 'Trigger');
      const connectableNodes = this.nodesContainerElement.add(this.orphanNodesContainerElement)
        .find('.node')
        .not(`#node-${fromNodeId}`)
        .not(`#node-${triggerNode.id}`)
        .not(`.shortcut-node`);

      connectableNodes.mouseover((e) => {
        e.stopPropagation();
        $(e.target).closest('.node').addClass('node-hovered');
      });

      // listen to mouseout event on all nodes
      connectableNodes.mouseout((e) => {
        e.stopPropagation();
        $(e.target).closest('.node').removeClass('node-hovered');
      });

      // listen to click event on all nodes
      connectableNodes.click((e) => {
        e.stopPropagation();
        // get the selected node id
        const selectedNodeId = $(e.target).closest('.node-container').attr('id');
        // get the selected node name
        const selectedNode = this.flow.graph.nodes[selectedNodeId];

        // create the node: fromNodeId, fromPortId, name, type, numberOfChildren
        // create the edge
        const fromPort = this.flow.graph.nodes[fromNodeId].ports.outputPorts.find((port) => port.id === fromPortId);
        const toPort = selectedNode.ports.inputPort;
        let edge = this.flow.graph.createEdge(null, fromPort, toPort);

        this.flow.setEdgeDetails(edge.id, { shortcut: true, shortcutFromPortId: fromPortId, shortcutToNodeId: selectedNodeId });
        this.flow.autoSave();
        removeSelectingMode();

        // render the flow
        this.renderFlow();

        // remove the click event from all nodes
        connectableNodes.off('click');
        // remove the mouseover event from all nodes
        connectableNodes.off('mouseover');
        // remove the mouseout event from all nodes
        connectableNodes.off('mouseout');
        // remove the class 'selecting-mode' from the canvas app div
        $('.canvas-app').removeClass('selecting-mode');
      });

      // add animation to the nodes
      connectableNodes.addClass('vibrate-1');
      // add random delay to the animation
      connectableNodes.each((i, node) => {
        $(node).css('animation-delay', `${i * 0.033}s`);
      });

      // add click event to the canvas app div
      $('.canvas-app').click((e) => {
        e.stopPropagation();
        removeSelectingMode();
      });

      // listen to escape key press
      $(document).keyup((e) => {
        if (e.key === "Escape") {
          removeSelectingMode();
        }
      });

      function removeSelectingMode() {
        // remove the click event from all nodes
        connectableNodes.off('click');
        // remove the mouseover event from all nodes
        connectableNodes.off('mouseover');
        // remove the mouseout event from all nodes
        connectableNodes.off('mouseout');
        // remove the class 'selecting-mode' from the canvas app div
        $('.canvas-app').removeClass('selecting-mode');
        // remove the animation from the nodes
        connectableNodes.removeClass('vibrate-1');
        // remove the instruction alert
        alert.remove();
      }
    });

    // add a click event to the node, if clicked, add the selected class
    modal.find('.node-in-list:gt(0)').click((e) => {
      e.stopPropagation();
      modal.find('.node-in-list').removeClass('selected');
      $(e.target).closest('.node-in-list').addClass('selected');
      modal.find('#create-node-modal-create-btn').removeClass('disabled');
    });

    // add click event to the create button
    modal.find('#create-node-modal-create-btn').click((e) => {
      e.stopPropagation();

      // get the selected node name
      const nodeTitle = modal.find('.node-in-list.selected .node-title').text();

      // get the node type
      const nodeType = modal.find('.node-in-list.selected').data('node-type');
      // create the node: fromNodeId, fromPortId, name, type, numberOfChildren
      const newNode = this.flow.createNode(fromNodeId, fromPortId, nodeTitle, nodeType);
      this.flow.autoSave();

      // render the flow
      this.renderFlow();

      // hide the modal
      modal.modal('hide');
    });

    // if the modal is not rendered yet, render it and add it to the body
    if ($('#create-node-modal').length === 0) {
      $('body').append(modal);
    }

    // show the modal
    modal.modal('show');
  }

  /**
   * Renders " Edit Node" modal.
   * @param {string} nodeId - The id of the node to edit.
   * @throws {Error} - If the node is not found.
   * @returns {void}
   */

  showNodeEditModal(nodeId) {
    this.nodeDetailsManager.renderEditNodeModal(nodeId);
  }
}

export default Canvas;