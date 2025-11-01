import React, { useEffect, useState } from 'react';
import { fetchLatestSensorData } from '../services/api';
import SensorCard from './SensorCard';
import WebSocketStatus from './WebSocketStatus';

const Dashboard: React.FC = () => {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchLatestSensorData();
        setSensorData(data);
      } catch (err) {
        setError('Failed to fetch sensor data');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <WebSocketStatus />
      <div className="sensor-cards">
        {sensorData.map(sensor => (
          <SensorCard key={sensor.deviceId} sensor={sensor} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;