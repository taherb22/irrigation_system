export interface SensorData {
  deviceId: string;
  moisture: number;
  temperature: number;
  battery: number;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}