import React, { Component } from 'react';

import { BrowserRouter as Router, Route, NavLink as Link, Redirect } from 'react-router-dom';
import './App.scss';
import { TransactionGraph } from './containers/TransactionGraph';
import { SmartContract } from './containers/SmartContract';

class App extends Component {
  render() {
    return (
      <Router>
        <main className="container">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <Link activeClassName="active" to="/smart-contract">Smart Contract Scanner</Link>
            </li>
            <li className="nav-item">
              <Link activeClassName="active" to="/graph">Transaction Graph</Link>
            </li>
          </ul>

          <Route path="/smart-contract" component={SmartContract} />
          <Route path="/graph" component={TransactionGraph} />
          <Redirect exact from="/" to="/smart-contract" />
          
        </main>
      </Router>
    );
  }
}

export default App;
