import { PrismaClient, EquipmentType } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate realistic telemetry data based on equipment type
function generateTelemetryData(type: EquipmentType, timestamp: Date, anomaly: boolean = false) {
  const baseData = {
    timestamp: timestamp.toISOString(),
  };

  switch (type) {
    case 'WASHER':
      return {
        ...baseData,
        powerWatts: anomaly ? 2800 + Math.random() * 200 : 1800 + Math.random() * 400,
        waterLiters: anomaly ? 65 + Math.random() * 15 : 45 + Math.random() * 10,
        temperature: 55 + Math.random() * 15,
        vibration: anomaly ? 5.5 + Math.random() * 2 : 1.5 + Math.random() * 1.5,
        cycleCount: Math.floor(Math.random() * 10),
        isRunning: Math.random() > 0.3,
      };

    case 'DRYER':
      return {
        ...baseData,
        powerWatts: anomaly ? 3500 + Math.random() * 300 : 2800 + Math.random() * 500,
        temperature: anomaly ? 95 + Math.random() * 10 : 65 + Math.random() * 15,
        vibration: anomaly ? 4.8 + Math.random() * 1.5 : 2.0 + Math.random() * 1.2,
        cycleCount: Math.floor(Math.random() * 8),
        isRunning: Math.random() > 0.3,
      };

    case 'PRESSER':
      return {
        ...baseData,
        powerWatts: anomaly ? 2000 + Math.random() * 200 : 1400 + Math.random() * 300,
        temperature: anomaly ? 200 + Math.random() * 20 : 140 + Math.random() * 40,
        vibration: anomaly ? 3.5 + Math.random() * 1 : 1.0 + Math.random() * 0.8,
        cycleCount: Math.floor(Math.random() * 15),
        isRunning: Math.random() > 0.4,
      };

    case 'STEAMER':
      return {
        ...baseData,
        powerWatts: anomaly ? 2200 + Math.random() * 200 : 1700 + Math.random() * 300,
        waterLiters: anomaly ? 35 + Math.random() * 10 : 20 + Math.random() * 10,
        temperature: anomaly ? 125 + Math.random() * 15 : 95 + Math.random() * 20,
        vibration: 0.5 + Math.random() * 0.5,
        cycleCount: Math.floor(Math.random() * 12),
        isRunning: Math.random() > 0.35,
      };

    default:
      return {
        ...baseData,
        powerWatts: 1500 + Math.random() * 500,
        temperature: 60 + Math.random() * 20,
        vibration: 2.0 + Math.random() * 1.0,
        isRunning: Math.random() > 0.3,
      };
  }
}

async function seedIoTData() {
  console.log('🌱 Seeding IoT telemetry data...\n');

  // Get all equipment with IoT enabled
  const equipment = await prisma.equipment.findMany({
    where: { isIotEnabled: true },
  });

  console.log(`Found ${equipment.length} IoT-enabled equipment\n`);

  if (equipment.length === 0) {
    console.log('⚠️  No IoT-enabled equipment found. Please enable IoT on equipment first.');
    return;
  }

  // Generate telemetry data for the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const equip of equipment) {
    console.log(`📊 Generating telemetry for: ${equip.name} (${equip.type})`);

    const telemetryLogs = [];
    let currentTime = new Date(thirtyDaysAgo);

    // Generate data points every 5 minutes for 30 days
    // That's ~8,640 data points per equipment
    // For performance, let's do every 15 minutes = ~2,880 points
    const intervalMinutes = 15;
    let dataPointsGenerated = 0;

    while (currentTime < now) {
      // Introduce anomalies 5% of the time
      const hasAnomaly = Math.random() < 0.05;

      const telemetryData = generateTelemetryData(equip.type, currentTime, hasAnomaly);

      telemetryLogs.push({
        equipmentId: equip.id,
        timestamp: currentTime,
        data: telemetryData,
      });

      currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
      dataPointsGenerated++;

      // Batch insert every 500 records for performance
      if (telemetryLogs.length >= 500) {
        await prisma.equipmentTelemetryLog.createMany({
          data: telemetryLogs,
        });
        telemetryLogs.length = 0; // Clear array
        process.stdout.write(`\r   ${dataPointsGenerated} data points generated...`);
      }
    }

    // Insert remaining logs
    if (telemetryLogs.length > 0) {
      await prisma.equipmentTelemetryLog.createMany({
        data: telemetryLogs,
      });
    }

    console.log(`\r   ✅ ${dataPointsGenerated} data points generated`);

    // Update current telemetry for this equipment
    const latestDataObj = telemetryLogs[telemetryLogs.length - 1]?.data ||
                          generateTelemetryData(equip.type, now);

    // Extract fields for EquipmentTelemetry (without timestamp)
    const { timestamp, ...telemetryFields } = latestDataObj as any;

    await prisma.equipmentTelemetry.upsert({
      where: { equipmentId: equip.id },
      create: {
        equipmentId: equip.id,
        ...telemetryFields,
        healthScore: 85 + Math.floor(Math.random() * 15), // 85-100
        efficiencyScore: 80 + Math.floor(Math.random() * 20), // 80-100
      },
      update: {
        ...telemetryFields,
        healthScore: 85 + Math.floor(Math.random() * 15),
        efficiencyScore: 80 + Math.floor(Math.random() * 20),
      },
    });
  }

  console.log('\n✅ IoT telemetry data seeding complete!\n');

  // Display summary
  const totalLogs = await prisma.equipmentTelemetryLog.count();
  console.log(`📈 Total telemetry logs: ${totalLogs.toLocaleString()}`);
  console.log(`⚙️  Equipment monitored: ${equipment.length}`);
  console.log(`📅 Date range: ${thirtyDaysAgo.toLocaleDateString()} - ${now.toLocaleDateString()}\n`);
}

async function main() {
  try {
    await seedIoTData();
  } catch (error) {
    console.error('❌ Error seeding IoT data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });