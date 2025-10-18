/**
 * IoT Telemetry Simulator
 *
 * This script simulates IoT devices sending telemetry data to the DryJets API.
 * Use this to test the IoT system without physical hardware.
 *
 * Usage:
 *   ts-node scripts/test-iot-telemetry.ts
 *
 * Or with custom settings:
 *   ts-node scripts/test-iot-telemetry.ts --equipment equip_123 --interval 10000
 */

interface TelemetryData {
  equipmentId: string;
  powerWatts?: number;
  waterLiters?: number;
  temperature?: number;
  vibration?: number;
  cycleType?: 'WASH' | 'DRY' | 'STEAM' | 'PRESS';
  isRunning?: boolean;
  cycleStartedAt?: string;
  cycleEstimatedEnd?: string;
}

interface EquipmentSimulation {
  id: string;
  name: string;
  type: 'WASHER' | 'DRYER' | 'PRESSER' | 'STEAMER';
  apiKey: string;
  cycleState: {
    isRunning: boolean;
    startedAt?: Date;
    estimatedEnd?: Date;
    cycleType?: string;
  };
}

class IoTSimulator {
  private apiUrl: string;
  private equipment: EquipmentSimulation[];
  private intervalMs: number;

  constructor(apiUrl: string = 'http://localhost:3000', intervalMs: number = 60000) {
    this.apiUrl = apiUrl;
    this.intervalMs = intervalMs;

    // Default test equipment
    // IMPORTANT: Replace these with actual equipment IDs and API keys from your database
    this.equipment = [
      {
        id: 'equip_test_washer_1',
        name: 'Test Washer #1',
        type: 'WASHER',
        apiKey: 'iot_test_key_washer_1',
        cycleState: { isRunning: false },
      },
      {
        id: 'equip_test_dryer_1',
        name: 'Test Dryer #1',
        type: 'DRYER',
        apiKey: 'iot_test_key_dryer_1',
        cycleState: { isRunning: false },
      },
      {
        id: 'equip_test_presser_1',
        name: 'Test Presser #1',
        type: 'PRESSER',
        apiKey: 'iot_test_key_presser_1',
        cycleState: { isRunning: false },
      },
    ];
  }

  /**
   * Generate realistic telemetry data for equipment
   */
  private generateTelemetry(equipment: EquipmentSimulation): TelemetryData {
    const telemetry: TelemetryData = {
      equipmentId: equipment.id,
    };

    // Randomly start/stop cycles (20% chance of state change)
    if (Math.random() < 0.2) {
      equipment.cycleState.isRunning = !equipment.cycleState.isRunning;

      if (equipment.cycleState.isRunning) {
        equipment.cycleState.startedAt = new Date();
        // Cycle duration: 20-60 minutes
        const durationMs = (20 + Math.random() * 40) * 60 * 1000;
        equipment.cycleState.estimatedEnd = new Date(Date.now() + durationMs);
        equipment.cycleState.cycleType = this.getCycleType(equipment.type);
      } else {
        equipment.cycleState.startedAt = undefined;
        equipment.cycleState.estimatedEnd = undefined;
        equipment.cycleState.cycleType = undefined;
      }
    }

    telemetry.isRunning = equipment.cycleState.isRunning;

    if (equipment.cycleState.startedAt) {
      telemetry.cycleStartedAt = equipment.cycleState.startedAt.toISOString();
    }

    if (equipment.cycleState.estimatedEnd) {
      telemetry.cycleEstimatedEnd = equipment.cycleState.estimatedEnd.toISOString();
    }

    if (equipment.cycleState.cycleType) {
      telemetry.cycleType = equipment.cycleState.cycleType as any;
    }

    // Generate sensor data based on equipment type and running state
    switch (equipment.type) {
      case 'WASHER':
        telemetry.powerWatts = equipment.cycleState.isRunning
          ? 1800 + Math.random() * 400 + this.getAnomalyOffset() // 1800-2200W + anomaly
          : 50 + Math.random() * 20; // 50-70W standby

        telemetry.waterLiters = equipment.cycleState.isRunning
          ? 40 + Math.random() * 20 // 40-60L per cycle
          : 0;

        telemetry.temperature = equipment.cycleState.isRunning
          ? 55 + Math.random() * 20 // 55-75°C
          : 20 + Math.random() * 5; // 20-25°C ambient

        telemetry.vibration = equipment.cycleState.isRunning
          ? 1.5 + Math.random() * 2 + this.getVibrationAnomaly() // 1.5-3.5 + anomaly
          : 0.1 + Math.random() * 0.2; // 0.1-0.3 idle
        break;

      case 'DRYER':
        telemetry.powerWatts = equipment.cycleState.isRunning
          ? 2800 + Math.random() * 400 + this.getAnomalyOffset() // 2800-3200W + anomaly
          : 60 + Math.random() * 20; // 60-80W standby

        telemetry.temperature = equipment.cycleState.isRunning
          ? 70 + Math.random() * 15 // 70-85°C
          : 25 + Math.random() * 5; // 25-30°C ambient

        telemetry.vibration = equipment.cycleState.isRunning
          ? 2 + Math.random() * 2 + this.getVibrationAnomaly() // 2-4 + anomaly
          : 0.1 + Math.random() * 0.2; // 0.1-0.3 idle
        break;

      case 'PRESSER':
        telemetry.powerWatts = equipment.cycleState.isRunning
          ? 1400 + Math.random() * 200 + this.getAnomalyOffset() // 1400-1600W + anomaly
          : 100 + Math.random() * 50; // 100-150W standby (heating element)

        telemetry.temperature = equipment.cycleState.isRunning
          ? 150 + Math.random() * 30 // 150-180°C
          : 80 + Math.random() * 20; // 80-100°C standby

        telemetry.vibration = equipment.cycleState.isRunning
          ? 0.5 + Math.random() * 0.5 // 0.5-1.0 (minimal)
          : 0.1 + Math.random() * 0.1; // 0.1-0.2 idle
        break;

      case 'STEAMER':
        telemetry.powerWatts = equipment.cycleState.isRunning
          ? 1700 + Math.random() * 200 + this.getAnomalyOffset() // 1700-1900W + anomaly
          : 80 + Math.random() * 30; // 80-110W standby

        telemetry.waterLiters = equipment.cycleState.isRunning
          ? 2 + Math.random() * 3 // 2-5L per session
          : 0;

        telemetry.temperature = equipment.cycleState.isRunning
          ? 95 + Math.random() * 25 // 95-120°C
          : 30 + Math.random() * 10; // 30-40°C ambient

        telemetry.vibration = equipment.cycleState.isRunning
          ? 0.3 + Math.random() * 0.4 // 0.3-0.7 (minimal)
          : 0.1 + Math.random() * 0.1; // 0.1-0.2 idle
        break;
    }

    // Round values
    if (telemetry.powerWatts) telemetry.powerWatts = Math.round(telemetry.powerWatts * 10) / 10;
    if (telemetry.waterLiters) telemetry.waterLiters = Math.round(telemetry.waterLiters * 10) / 10;
    if (telemetry.temperature) telemetry.temperature = Math.round(telemetry.temperature * 10) / 10;
    if (telemetry.vibration) telemetry.vibration = Math.round(telemetry.vibration * 10) / 10;

    return telemetry;
  }

  /**
   * Get cycle type based on equipment
   */
  private getCycleType(equipmentType: string): string {
    switch (equipmentType) {
      case 'WASHER':
        return 'WASH';
      case 'DRYER':
        return 'DRY';
      case 'PRESSER':
        return 'PRESS';
      case 'STEAMER':
        return 'STEAM';
      default:
        return 'WASH';
    }
  }

  /**
   * Occasionally simulate power anomaly (5% chance)
   */
  private getAnomalyOffset(): number {
    if (Math.random() < 0.05) {
      // 5% chance of 30-50% power spike
      return Math.random() * 1000;
    }
    return 0;
  }

  /**
   * Occasionally simulate high vibration (3% chance)
   */
  private getVibrationAnomaly(): number {
    if (Math.random() < 0.03) {
      // 3% chance of high vibration (5.0-8.0)
      return 3 + Math.random() * 3;
    }
    return 0;
  }

  /**
   * Send telemetry to API
   */
  private async sendTelemetry(
    equipment: EquipmentSimulation,
    telemetry: TelemetryData
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/iot/telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': equipment.apiKey,
        },
        body: JSON.stringify(telemetry),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ [${equipment.name}] Failed:`, error);
        return;
      }

      const result = await response.json();

      // Log with color based on health status
      const healthEmoji =
        result.healthStatus === 'EXCELLENT'
          ? '✅'
          : result.healthStatus === 'GOOD'
            ? '🟢'
            : result.healthStatus === 'FAIR'
              ? '🟡'
              : result.healthStatus === 'POOR'
                ? '🟠'
                : '🔴';

      console.log(
        `${healthEmoji} [${equipment.name}] Sent telemetry | Health: ${result.telemetry.healthScore}% | Efficiency: ${result.telemetry.efficiencyScore}% | ${telemetry.isRunning ? '🔄 RUNNING' : '⏸️  IDLE'}`
      );

      if (result.issues && result.issues.length > 0) {
        console.log(`   ⚠️  Issues: ${result.issues.join(', ')}`);
      }
    } catch (error) {
      console.error(`❌ [${equipment.name}] Error:`, error);
    }
  }

  /**
   * Start simulation
   */
  async start(): Promise<void> {
    console.log('🚀 IoT Telemetry Simulator Started');
    console.log(`📡 API URL: ${this.apiUrl}`);
    console.log(`⏱️  Interval: ${this.intervalMs / 1000}s`);
    console.log(`🔧 Equipment: ${this.equipment.length} devices`);
    console.log('');
    console.log('Equipment List:');
    this.equipment.forEach((eq) => {
      console.log(`  - ${eq.name} (${eq.type}) [ID: ${eq.id}]`);
    });
    console.log('');
    console.log('📊 Starting telemetry transmission...');
    console.log('');

    // Send initial telemetry
    await this.sendAllTelemetry();

    // Set up interval
    setInterval(async () => {
      await this.sendAllTelemetry();
    }, this.intervalMs);
  }

  /**
   * Send telemetry for all equipment
   */
  private async sendAllTelemetry(): Promise<void> {
    for (const equipment of this.equipment) {
      const telemetry = this.generateTelemetry(equipment);
      await this.sendTelemetry(equipment, telemetry);
    }
    console.log('');
  }

  /**
   * Send single test telemetry (useful for testing)
   */
  async sendTestTelemetry(equipmentIndex: number = 0): Promise<void> {
    if (equipmentIndex >= this.equipment.length) {
      console.error('Invalid equipment index');
      return;
    }

    const equipment = this.equipment[equipmentIndex];
    const telemetry = this.generateTelemetry(equipment);

    console.log('📤 Sending test telemetry:');
    console.log(JSON.stringify(telemetry, null, 2));
    console.log('');

    await this.sendTelemetry(equipment, telemetry);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const apiUrl = args.find((arg) => arg.startsWith('--api-url='))?.split('=')[1] || 'http://localhost:3000';
  const interval = parseInt(args.find((arg) => arg.startsWith('--interval='))?.split('=')[1] || '60000');

  const simulator = new IoTSimulator(apiUrl, interval);

  if (args.includes('--test')) {
    // Send single test telemetry
    simulator.sendTestTelemetry(0);
  } else {
    // Start continuous simulation
    simulator.start();
  }
}

export default IoTSimulator;
