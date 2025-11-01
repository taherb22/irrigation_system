import axios from 'axios';
import { ApiResponse, SensorData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get latest sensor data for all devices
export const fetchLatestSensorData = async (): Promise<ApiResponse<SensorData[]>> => {
  const response = await axios.get(`${API_BASE_URL}/sensors/latest`);
  return response.data;
};

// Get historical data for a specific device
export const fetchDeviceHistory = async (deviceId: string, hours: number = 24): Promise<ApiResponse<SensorData[]>> => {
  const response = await axios.get(`${API_BASE_URL}/sensors/${deviceId}/history`, {
    params: { hours }
  });
  return response.data;
};

// Get dashboard analytics
export const fetchDashboardAnalytics = async (): Promise<ApiResponse<any>> => {
  const response = await axios.get(`${API_BASE_URL}/analytics/dashboard`);
  return response.data;
};

// Control actuator (irrigation valve)
export const controlActuator = async (deviceId: string, action: string, duration?: number): Promise<ApiResponse<any>> => {
  const response = await axios.post(`${API_BASE_URL}/actuators/control`, {
    deviceId,
    action,
    duration
  });
  return response.data;
};

// Register new device
export const registerDevice = async (deviceId: string, name: string, location: string): Promise<ApiResponse<any>> => {
  const response = await axios.post(`${API_BASE_URL}/devices/register`, {
    deviceId,
    name,
    location
  });
  return response.data;
};