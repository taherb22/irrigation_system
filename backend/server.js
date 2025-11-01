// backend/server.js - Express + MQTT Integration

const express = require('express');
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// MongoDB Schema
// ============================================
const SensorDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  moisture: { type: Number, required: true },
  temperature: { type: Number, required: true },
  battery: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

const SensorData = mongoose.model('SensorData', SensorDataSchema);

// ============================================
// MongoDB Connection
// ============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agridb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// ============================================
// MQTT Client Setup
// ============================================
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883', {
  clientId: 'backend-server-' + Math.random().toString(16).substr(2, 8),
  clean: true,
  reconnectPeriod: 5000
});

mqttClient.on('connect', () => {
  console.log('✅ MQTT Broker Connected');
  
  // Subscribe to all sensor topics
  mqttClient.subscribe('farm/sensors/#', (err) => {
    if (err) {
      console.error('❌ MQTT Subscribe Error:', err);
    } else {
      console.log('📡 Subscribed to: farm/sensors/#');
    }
  });
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
});

// ============================================
// WebSocket Server for Real-time Updates
// ============================================
const wss = new WebSocket.Server({ noServer: true });
const wsClients = new Set();

wss.on('connection', (ws) => {
  console.log('📱 New WebSocket client connected');
  wsClients.add(ws);

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log('📱 WebSocket client disconnected');
  });
});

// Broadcast to all WebSocket clients
function broadcastToClients(data) {
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// ============================================
// MQTT Message Handler
// ============================================
mqttClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log(`📩 Received from ${topic}:`, payload);

    // Save to MongoDB
    const sensorData = new SensorData({
      deviceId: payload.deviceId,
      moisture: payload.moisture,
      temperature: payload.temperature,
      battery: payload.battery,
      timestamp: new Date(payload.timestamp)
    });

    await sensorData.save();
    console.log(`💾 Saved to DB: ${payload.deviceId}`);

    // Check for alerts (Low moisture)
    if (payload.moisture < 30) {
      console.log(`⚠️  ALERT: Low moisture detected on ${payload.deviceId}`);
      
      // Trigger irrigation (publish to actuator topic)
      mqttClient.publish('farm/actuators/irrigation', JSON.stringify({
        deviceId: payload.deviceId,
        action: 'open_valve',
        duration: 600 // seconds
      }));
    }

    // Broadcast to WebSocket clients for real-time dashboard
    broadcastToClients({
      type: 'sensor_update',
      data: payload
    });

  } catch (err) {
    console.error('❌ Error processing MQTT message:', err);
  }
});

// ============================================
// REST API Endpoints
// ============================================

// Get latest sensor data for all devices
app.get('/api/sensors/latest', async (req, res) => {
  try {
    const devices = await SensorData.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: '$deviceId',
          latestData: { $first: '$$ROOT' }
        }
      }
    ]);

    res.json({
      success: true,
      data: devices.map(d => d.latestData)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get historical data for a specific device
app.get('/api/sensors/:deviceId/history', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { hours = 24 } = req.query;
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const data = await SensorData.find({
      deviceId,
      timestamp: { $gte: startTime }
    }).sort({ timestamp: -1 }).limit(1000);

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Control actuator (irrigation valve)
app.post('/api/actuators/control', (req, res) => {
  try {
    const { deviceId, action, duration } = req.body;
    
    if (!deviceId || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'deviceId and action are required' 
      });
    }

    // Publish MQTT command to actuator
    mqttClient.publish(`farm/actuators/${deviceId}`, JSON.stringify({
      action,
      duration: duration || 300,
      timestamp: Date.now()
    }));

    res.json({
      success: true,
      message: `Command sent to ${deviceId}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get dashboard analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const totalDevices = await SensorData.distinct('deviceId').then(d => d.length);
    const totalReadings = await SensorData.countDocuments();
    
    const last24h = await SensorData.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const avgMoisture = last24h.reduce((sum, d) => sum + d.moisture, 0) / last24h.length;
    const avgTemp = last24h.reduce((sum, d) => sum + d.temperature, 0) / last24h.length;

    res.json({
      success: true,
      data: {
        totalDevices,
        totalReadings,
        avgMoisture: avgMoisture.toFixed(1),
        avgTemperature: avgTemp.toFixed(1),
        readingsLast24h: last24h.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register new device
app.post('/api/devices/register', async (req, res) => {
  try {
    const { deviceId, name, location } = req.body;
    
    // In production, save device info to a separate collection
    console.log(`📝 Registered new device: ${deviceId}`);
    
    res.json({
      success: true,
      message: `Device ${deviceId} registered successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// WebSocket Upgrade Handler
// ============================================
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  mqttClient.end();
  mongoose.connection.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});