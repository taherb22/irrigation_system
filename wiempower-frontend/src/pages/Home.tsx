import React from 'react';
import Dashboard from '../components/Dashboard';
import WebSocketStatus from '../components/WebSocketStatus';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Wiempower</h1>
      <WebSocketStatus />
      <Dashboard />
    </div>
  );
};

export default Home;