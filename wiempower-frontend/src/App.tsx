import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Home from './pages/Home';
import DeviceHistory from './pages/DeviceHistory';
import WebSocketStatus from './components/WebSocketStatus';
import './index.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <WebSocketStatus />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/device-history/:deviceId" component={DeviceHistory} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;