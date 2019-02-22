import React, { Component } from 'react';
import { BrowserRouter as Router, Route, NavLink as Link, Redirect, Switch } from 'react-router-dom';

import { TransactionGraph } from './containers/TransactionGraph';
import { SmartContract } from './containers/SmartContract';
import styled from 'styled-components';

const Wrapper = styled.div`
  .nav-bar {
    padding: 10px;
  }

  main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
  }
`;
export class App extends Component {
  render() {
    return (
      <Router>
        <Wrapper>
          <nav className="nav-bar">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <Link activeClassName="active" to="/smart-contract">Smart Contract</Link>
              </li>
              <li className="nav-item">
                <Link activeClassName="active" to="/graph">Transaction Graph</Link>
              </li>
            </ul>
          </nav>
          <main className="main">
            <div className="content">
              <Switch>
                <Route path="/smart-contract" component={SmartContract} />
                <Route path="/graph" component={TransactionGraph} />
                <Redirect exact from="/" to="/smart-contract" />
              </Switch>
            </div>
          </main>
        </Wrapper>
      </Router>
    );
  }
}
