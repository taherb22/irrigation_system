const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // Format to local date and time
};

const formatSensorData = (data: number): string => {
  return `${data.toFixed(2)} units`; // Format to two decimal places
};

export { formatTimestamp, formatSensorData };