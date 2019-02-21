import { observable, computed, autorun, observe, intercept } from 'mobx';
import { Node } from '../graph/Node';
import { random } from '../utils';

export interface Popup {
  position: { x: number, y: number };
  active: boolean;
  info?: any;
}
export class GraphStore {
  @observable root: Node = new Node(0);
  @observable nodes: Node[] = [];
  @observable alphaTimeout: number = 10;
  @observable latestCriticalLevel: number = null;
  @observable maxLevel: number = -1;
  @observable popup: Popup = {
    position: {
      x: 0,
      y: 0
    },
    active: false
  };

  constructor() {
    intercept(this, 'root', (change) => {
      this.nodes = this.visit(change.newValue) || [];
      return change;
    });
  }

  private visit(node: Node = this.root, visited: any = {}, path: any[] = [], level: number = this.root.level) {
    if (!node || visited[node.name]) {
      return false;
    }
    
    path.push(node);
    visited[node.name] = true;
    node.level = node.level || level;
    this.maxLevel = Math.max(this.maxLevel, node.level);
    this.processCritical(node);
    
    for (let i = 0; i < node.children.length; i++) {
      this.visit(node.children[i], visited, path, level + 1);
    }

    return path;
  }
  private criticalLevel = random(50, 80);
  private processCritical(node: Node) {
    if (node.level >= this.criticalLevel) {
      node.critical = true;
      this.criticalLevel += random(50, 80);
      this.latestCriticalLevel = node.level;
    }
  }

  public isValid(nodes: Node[] = this.nodes) {
    const visits: any = {};
    for (let i = 0; i < nodes.length; i++) {
      const parent = nodes[i];

      for (let j = 0; j < parent.children.length; j++) {
        const child = parent.children[j];
        if (visits[child.name]) {
          return false;
        }
        visits[child.name] = true;
      }

    }

    return true;
  }

  @computed get links() {
    return this.nodes.reduce((acc, node) => {
      return [...acc, ...node.children.map((child: Node) => ({
        source: node.name,
        target: child.name
      }))];
    }, []);
  }
}
