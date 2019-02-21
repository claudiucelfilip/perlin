import { GraphStore } from "../store/GraphStore";
import { random, uniqueRandom } from "../utils";
import { Node } from './Node';

export class NodeSource {
  private initialNodes = 130;
  private graphWidth = 4;
  private initAlphaSourceTimeout: number;

  constructor(private store: GraphStore) {}

  public delayedInit(duration: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.createInitialNodes();
        this.initAlphaSource();
        resolve();
      }, duration);
    });
  }

  private generateRandomId() {
    return (new Date()).getTime() + random(0, 100);
  }

  private addNode(newNode: Node) {
    let nodes = this.store.nodes;
    let nodesLen = nodes.length;
    if (!nodesLen) {
      this.store.root = newNode;
      return;
    }

    let randomIndex: number;
    let random = uniqueRandom(0, nodesLen);
    while ((randomIndex = random()) !== null) {
      let children = nodes[randomIndex].children;
      if (children.length < this.graphWidth && children.indexOf(newNode) === -1) {
        nodes[randomIndex].children.push(newNode);

        if (!this.store.isValid()) {
          nodes[randomIndex].children.pop();
        }
      }
    }
    this.store.root = { ...this.store.root };
  }

  private createInitialNodes() {
    let counter = 0;
    while (counter++ < this.initialNodes) {
      this.addNode(new Node(this.generateRandomId()));
    }
  }

  private initAlphaSource() {
    this.initAlphaSourceTimeout = setTimeout(() => {
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

  public destroy() {
    clearInterval(this.initAlphaSourceTimeout);
  }
}