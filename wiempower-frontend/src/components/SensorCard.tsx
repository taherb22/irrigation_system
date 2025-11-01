import React from 'react';
import { SensorData } from '../types';

interface SensorCardProps {
  sensorData: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensorData }) => {
  return (
    <div className="sensor-card">
      <h3>Device ID: {sensorData.deviceId}</h3>
      <p>Moisture: {sensorData.moisture} %</p>
      <p>Temperature: {sensorData.temperature} °C</p>
      <p>Battery: {sensorData.battery} %</p>
      <p>Last Updated: {new Date(sensorData.timestamp).toLocaleString()}</p>
    </div>
  );
};

export default SensorCard;