#!/usr/bin/env python3
"""
LoRa Sensor Node Simulator
Simulates Arduino/ESP32 + LoRa module hardware
Sends sensor data packets to gateway via LoRaWAN protocol simulation
"""

import time
import random
import json
import paho.mqtt.client as mqtt
from datetime import datetime
import struct

class LoRaNodeSimulator:
    """Simulates a LoRa sensor node with sensors"""
    
    def __init__(self, device_id, node_name, mqtt_broker='localhost', mqtt_port=1883):
        self.device_id = device_id
        self.node_name = node_name
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        
        # Sensor states
        self.moisture = 50.0 + random.uniform(-10, 10)
        self.temperature = 28.0 + random.uniform(-5, 5)
        self.battery = 100.0
        
        # LoRa parameters
        self.frequency = 868.1  # MHz (EU band)
        self.spreading_factor = 7  # SF7
        self.bandwidth = 125  # kHz
        self.tx_power = 14  # dBm
        
        # Statistics
        self.packets_sent = 0
        self.transmission_errors = 0
        
        # MQTT client (simulates gateway connection)
        self.client = None
        self.connected = False
        
    def connect_to_gateway(self):
        """Simulate connection to LoRa gateway (via MQTT)"""
        try:
            self.client = mqtt.Client(client_id=f"lora_node_{self.device_id}")
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            
            print(f"[{self.device_id}] 🔌 Connecting to gateway at {self.mqtt_broker}:{self.mqtt_port}...")
            self.client.connect(self.mqtt_broker, self.mqtt_port, 60)
            self.client.loop_start()
            
            # Wait for connection
            timeout = 10
            while not self.connected and timeout > 0:
                time.sleep(0.5)
                timeout -= 0.5
                
            if not self.connected:
                raise Exception("Connection timeout")
                
        except Exception as e:
            print(f"[{self.device_id}] ❌ Connection failed: {e}")
            return False
            
        return True
    
    def _on_connect(self, client, userdata, flags, rc):
        """MQTT connection callback"""
        if rc == 0:
            self.connected = True
            print(f"[{self.device_id}] ✅ Connected to gateway")
        else:
            print(f"[{self.device_id}] ❌ Connection failed with code {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """MQTT disconnection callback"""
        self.connected = False
        print(f"[{self.device_id}] ⚠️  Disconnected from gateway")
    
    def read_sensors(self):
        """Simulate reading from physical sensors"""
        # Simulate realistic sensor drift
        self.moisture += random.uniform(-2, 2)
        self.moisture = max(0, min(100, self.moisture))
        
        self.temperature += random.uniform(-1, 1)
        self.temperature = max(15, min(45, self.temperature))
        
        # Battery drain (very slow)
        self.battery -= random.uniform(0.01, 0.05)
        self.battery = max(0, self.battery)
        
        return {
            'moisture': round(self.moisture, 1),
            'temperature': round(self.temperature, 1),
            'battery': round(self.battery, 1)
        }
    
    def create_lora_packet(self, sensor_data):
        """Create LoRaWAN-style packet structure"""
        packet = {
            'header': {
                'device_id': self.device_id,
                'frame_counter': self.packets_sent,
                'frequency': self.frequency,
                'sf': f'SF{self.spreading_factor}',
                'bandwidth': self.bandwidth,
                'tx_power': self.tx_power
            },
            'payload': {
                'deviceId': self.device_id,
                'moisture': sensor_data['moisture'],
                'temperature': sensor_data['temperature'],
                'battery': sensor_data['battery'],
                'timestamp': int(time.time() * 1000)
            },
            'metadata': {
                'rssi': random.randint(-120, -70),  # Signal strength
                'snr': round(random.uniform(-5, 10), 1),  # Signal-to-noise ratio
                'node_name': self.node_name
            }
        }
        return packet
    
    def transmit_lora_packet(self, packet):
        """Simulate LoRa transmission to gateway"""
        if not self.connected:
            print(f"[{self.device_id}] ❌ Not connected to gateway")
            return False
        
        try:
            # Simulate packet loss (5% chance)
            if random.random() < 0.05:
                self.transmission_errors += 1
                print(f"[{self.device_id}] 📡 ❌ Packet lost in transmission")
                return False
            
            # Simulate transmission delay
            time.sleep(random.uniform(0.1, 0.3))
            
            # Publish to MQTT (simulates gateway receiving LoRa packet)
            topic = f"farm/sensors/{self.device_id}"
            payload = json.dumps(packet['payload'])
            
            self.client.publish(topic, payload, qos=1)
            self.packets_sent += 1
            
            print(f"[{self.device_id}] 📡 ✅ Packet sent | "
                  f"Moisture: {packet['payload']['moisture']}% | "
                  f"Temp: {packet['payload']['temperature']}°C | "
                  f"RSSI: {packet['metadata']['rssi']} dBm")
            
            return True
            
        except Exception as e:
            self.transmission_errors += 1
            print(f"[{self.device_id}] ❌ Transmission error: {e}")
            return False
    
    def enter_deep_sleep(self, duration_seconds):
        """Simulate ESP32 deep sleep mode (power saving)"""
        print(f"[{self.device_id}] 😴 Entering deep sleep for {duration_seconds}s...")
        time.sleep(duration_seconds)
        print(f"[{self.device_id}] 🔋 Wake up from deep sleep")
    
    def run_node_loop(self, interval_seconds=60, deep_sleep=True):
        """Main node operation loop"""
        print(f"\n{'='*60}")
        print(f"🌱 Starting LoRa Node: {self.node_name}")
        print(f"   Device ID: {self.device_id}")
        print(f"   Frequency: {self.frequency} MHz")
        print(f"   Spreading Factor: SF{self.spreading_factor}")
        print(f"   Transmission Interval: {interval_seconds}s")
        print(f"{'='*60}\n")
        
        if not self.connect_to_gateway():
            return
        
        try:
            while True:
                # Read sensors
                sensor_data = self.read_sensors()
                
                # Create LoRa packet
                packet = self.create_lora_packet(sensor_data)
                
                # Transmit
                self.transmit_lora_packet(packet)
                
                # Print statistics
                success_rate = ((self.packets_sent / (self.packets_sent + self.transmission_errors)) * 100) if (self.packets_sent + self.transmission_errors) > 0 else 0
                print(f"[{self.device_id}] 📊 Stats: Sent={self.packets_sent}, Errors={self.transmission_errors}, Success Rate={success_rate:.1f}%\n")
                
                # Sleep or deep sleep
                if deep_sleep:
                    self.enter_deep_sleep(interval_seconds)
                else:
                    time.sleep(interval_seconds)
                    
        except KeyboardInterrupt:
            print(f"\n[{self.device_id}] 🛑 Shutting down node...")
            self.client.loop_stop()
            self.client.disconnect()
            print(f"[{self.device_id}] 👋 Node stopped")

def main():
    """Run multiple simulated nodes"""
    import sys
    
    # Configuration
    MQTT_BROKER = 'localhost'  # Change to your gateway IP
    MQTT_PORT = 1883
    
    # Check command line arguments
    if len(sys.argv) > 1:
        device_id = sys.argv[1]
        node_name = sys.argv[2] if len(sys.argv) > 2 else f"Node {device_id}"
        interval = int(sys.argv[3]) if len(sys.argv) > 3 else 60
    else:
        # Default configuration
        device_id = 'node_01'
        node_name = 'Field A - Soil Sensor'
        interval = 60
    
    # Create and run node
    node = LoRaNodeSimulator(
        device_id=device_id,
        node_name=node_name,
        mqtt_broker=MQTT_BROKER,
        mqtt_port=MQTT_PORT
    )
    
    node.run_node_loop(interval_seconds=interval, deep_sleep=True)

if __name__ == '__main__':
    main()

"""
Usage Examples:
---------------

Single node:
$ python lora_node_simulator.py node_01 "Field A" 60

Multiple nodes (in separate terminals):
$ python lora_node_simulator.py node_01 "Field A - Soil" 60
$ python lora_node_simulator.py node_02 "Field B - Climate" 45
$ python lora_node_simulator.py node_03 "Field C - NPK" 90

For testing without deep sleep (faster):
Edit the main() function and set deep_sleep=False
"""