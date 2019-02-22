import React, { Component, ChangeEvent } from 'react';
import { Graph } from '../graph/Graph';
import styled from 'styled-components';
import { GraphStore } from '../store/GraphStore';
import { NodePopup } from '../components/NodePopup'
import { observer } from 'mobx-react';
import { NodeSource } from '../graph/NodeSource';

const Wrapper = styled.div`
  position: relative;
  width: calc(100vw - 60px);
  height: calc(100vh - 100px);

  .canvas-container {
    position: absolute;
    top: 0;
    left: 0;
    
    width: 100%;
    height: 100%;
    border: solid 1px #eee;
    border-radius: 5px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.15);

    &.loading {
      background: url('/assets/svgs/preloader.svg') center center no-repeat;
      background-size: 30px auto;
    }
    &.grabbed {
      cursor: grab;
    }
  }
  .info {
    position: absolute;
    top: 15px;
    left: 15px;
    font-size: 12px;
    background: rgba(255,255,255,0.95);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    padding: 15px;
    border-radius: 5px;
  }
  .range-input {
    margin-left: 5px;
    vertical-align: middle;
  }
  .info-label {
    font-weight: bold;
  }
`;

@observer
export class TransactionGraph extends Component {
  private graphRef = React.createRef<HTMLDivElement>();
  private graph: Graph;
  private nodeSource: NodeSource;
  private store = new GraphStore();

  state = {
    loading: true
  };

  componentDidMount() {
    this.nodeSource = new NodeSource(this.store);
    this.graph = new Graph(this.graphRef.current, this.store);

    /*  
    *   Function is computationally intensive so we need to have 
    *   time prepare the UI rendered before starting node sourcing
    */
    this.nodeSource.delayedInit(600)
      .then(() => this.setState({ loading: false }));
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
        <div className={'canvas-container ' + (this.state.loading ? 'loading' : '')} ref={this.graphRef}></div>
        <div className="info">
          <div>
            <span className="info-label">Nodes</span>: {this.store.nodes.length}<br />
            <span className="info-label">Root level</span>: {this.store.root.level}<br />
            <span className="info-label">Leaf level</span>: {this.store.maxLevel}<br />
            <span className="info-label">Latest critical at level</span>: {this.store.latestCriticalLevel || 'none'}<br />
            <span className="info-label">/alpha timeout</span>: {this.store.alphaTimeout}ms <br />
            <span className="info-label">/alpha delay</span>: 
            <input className="range-input" type="range" min="10" max="10000" step="10" onChange={this.changeAlphaTimeout} />
          </div>
        </div>

        <NodePopup {...this.store.popup} />
      </Wrapper>
    );
  }
}
