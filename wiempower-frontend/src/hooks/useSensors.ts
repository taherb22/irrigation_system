import { useEffect, useState } from 'react';
import { fetchLatestSensors } from '../services/api';
import { SensorData } from '../types';

const useSensors = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getSensors = async () => {
    try {
      setLoading(true);
      const response = await fetchLatestSensors();
      if (response.success) {
        setSensors(response.data);
      } else {
        setError('Failed to fetch sensor data');
      }
    } catch (err) {
      setError('An error occurred while fetching sensor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSensors();
  }, []);

  return { sensors, loading, error };
};

export default useSensors;