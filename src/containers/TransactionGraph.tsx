import React, { Component, ChangeEvent } from 'react';
import { Graph } from '../graph/Graph';
import styled from 'styled-components';
import { GraphStore } from '../store/GraphStore';
import { NodePopup } from '../components/NodePopup'
import { observer } from 'mobx-react';
import { NodeSource } from '../graph/NodeSource';

const Wrapper = styled.div`
  .canvas-container {
    width: 100%;
    height: 80vh;
    border: solid 1px #aaa;

    &.grabbed {
      cursor: grab;
    }
  }
  .range-input {
    margin-left: 5px;
  }
`;

@observer
export class TransactionGraph extends Component {
  graphRef = React.createRef<HTMLDivElement>();
  graph: Graph;
  nodeSource: NodeSource;
  store = new GraphStore();

  componentDidMount() {
    this.graph = new Graph(this.graphRef.current, this.store);
    this.nodeSource = new NodeSource(this.store);
  }

  componentWillUnmount() {
    this.graph.destroy();
    this.nodeSource.destroy();
  }

  changeAlphaTimeout = (event: ChangeEvent<HTMLInputElement>) => {
    this.store.alphaTimeout = parseInt(event.target.value);
  }

  render() {
    (this.graph && this.graph.updateSizes());
    return (
      <Wrapper>
        <div className="row">
          <h1 className="col">Transaction Graph</h1>
          
          <div>
            Nodes: {this.store.nodes.length}<br/>
            Root level: {this.store.root.level}<br/>
            Max level: {this.store.maxLevel}<br/>
            Latest critical at level: {this.store.latestCriticalLevel || 'null'}<br/>
            /alpha timeout: {this.store.alphaTimeout}ms 
            <input className="range-input" type="range" min="10" max="10000" step="10" onChange={this.changeAlphaTimeout} />
          </div>
          
        </div>
        <div className="canvas-container" ref={this.graphRef}></div>
        <NodePopup {...this.store.popup} />
      </Wrapper>
    );
  }
}
