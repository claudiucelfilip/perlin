import { GraphStore } from "../store/GraphStore";
import { random, noRepeatRandom } from "../utils";
import { Node } from './Node';

export class NodeSource {
  initialNodes = 200;
  graphWidth = 4;
  interval: number;

  constructor(private store: GraphStore) {
    this.createInitialNodes();
    this.initAlphaSource();
  }

  generateRandomId() {
    return (new Date()).getTime() + random(0, 100);
  }

  addNode(newNode: Node) {
    let nodes = this.store.nodes;
    let nodesLen = nodes.length;
    if (!nodesLen) {
      this.store.root = newNode;
      return;
    }

    let randomIndex: number;
    let random = noRepeatRandom(0, nodesLen);
    while ((randomIndex = random()) !== null) {
      let children = nodes[randomIndex].children;
      if (children.length < this.graphWidth && children.indexOf(newNode) === -1) {
        nodes[randomIndex].children.push(newNode);

        if (!this.store.isValid()) {
          nodes[randomIndex].children.pop();
        } else {
          this.store.root = { ...this.store.root };
        }
      }
    }
  }

  createInitialNodes() {
    let counter = 0;
    while (counter++ < this.initialNodes) {
      this.addNode(new Node(this.generateRandomId()));
    }
  }

  initAlphaSource() {
    this.interval = setTimeout(() => {
      let nodesAdded = random(2, 4);
      let count = 0;
      const nodesLen = this.store.nodes.length;
      while (count++ < nodesAdded) {
        this.addNode(new Node(this.generateRandomId()));
      }

      if (nodesLen > this.initialNodes) {
        this.store.root = this.store.nodes[1];
      }
      this.initAlphaSource();

    }, this.store.alphaTimeout);
  }

  destroy() {
    clearInterval(this.interval);
  }
}