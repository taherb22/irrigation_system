# WiEmpower Frontend

## Overview
WiEmpower is a frontend application designed to work with the WiEmpower backend server, providing real-time monitoring and control of agricultural sensors. This application allows users to visualize sensor data, manage devices, and receive alerts based on sensor readings.

## Features
- Real-time updates from sensors using WebSocket.
- Dashboard for an overview of sensor data and analytics.
- Historical data visualization for individual devices.
- User-friendly interface for managing devices and controlling actuators.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd wiempower-frontend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

### Running the Application
To start the development server, run:
```
npm run dev
```
The application will be available at `http://localhost:3000`.

### Building for Production
To create a production build, run:
```
npm run build
```
The build files will be generated in the `dist` directory.

## Directory Structure
- `public/`: Contains static files, including the main HTML file.
- `src/`: Contains the source code for the application.
  - `components/`: Reusable components for the application.
  - `pages/`: Page components for different routes.
  - `services/`: API and WebSocket service functions.
  - `hooks/`: Custom hooks for managing state and logic.
  - `types/`: TypeScript interfaces and types.
  - `utils/`: Utility functions for data formatting.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.