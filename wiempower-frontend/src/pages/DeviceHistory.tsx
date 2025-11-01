import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDeviceHistory } from '../services/api';
import { SensorData } from '../types';

const DeviceHistory: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDeviceHistory = async () => {
      try {
        const data = await fetchDeviceHistory(deviceId);
        setHistory(data);
      } catch (err) {
        setError('Failed to fetch device history');
      } finally {
        setLoading(false);
      }
    };

    getDeviceHistory();
  }, [deviceId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Device History for {deviceId}</h1>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Moisture</th>
            <th>Temperature</th>
            <th>Battery</th>
          </tr>
        </thead>
        <tbody>
          {history.map((data) => (
            <tr key={data.timestamp.toString()}>
              <td>{new Date(data.timestamp).toLocaleString()}</td>
              <td>{data.moisture}</td>
              <td>{data.temperature}</td>
              <td>{data.battery}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceHistory;