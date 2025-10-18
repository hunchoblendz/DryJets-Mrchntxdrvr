import type { Meta, StoryObj } from '@storybook/react';
import { EquipmentCard } from './EquipmentCard';

const meta: Meta<typeof EquipmentCard> = {
  title: 'Equipment/EquipmentCard',
  component: EquipmentCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EquipmentCard>;

export const ExcellentHealth: Story = {
  args: {
    equipment: {
      id: '1',
      name: 'Steam Boiler #1',
      type: 'STEAM_BOILER',
      status: 'OPERATIONAL',
      isIotEnabled: true,
      lastTelemetryAt: new Date().toISOString(),
      healthScore: 91,
      healthStatus: 'EXCELLENT',
      efficiencyScore: 88,
      isRunning: true,
      openAlerts: 0,
      lastMaintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    onClick: () => alert('Clicked!'),
  },
};

export const GoodHealth: Story = {
  args: {
    equipment: {
      id: '2',
      name: 'Washer #1',
      type: 'WASHER',
      status: 'OPERATIONAL',
      isIotEnabled: true,
      lastTelemetryAt: new Date().toISOString(),
      healthScore: 87,
      healthStatus: 'GOOD',
      efficiencyScore: 92,
      isRunning: true,
      openAlerts: 0,
      lastMaintenanceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      nextMaintenanceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
};

export const FairHealthWithAlerts: Story = {
  args: {
    equipment: {
      id: '3',
      name: 'Dryer #1',
      type: 'DRYER',
      status: 'OPERATIONAL',
      isIotEnabled: true,
      lastTelemetryAt: new Date().toISOString(),
      healthScore: 74,
      healthStatus: 'FAIR',
      efficiencyScore: 68,
      isRunning: false,
      openAlerts: 2,
      lastMaintenanceDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
};

export const PoorHealthMaintenanceRequired: Story = {
  args: {
    equipment: {
      id: '4',
      name: 'Washer #2',
      type: 'WASHER',
      status: 'MAINTENANCE_REQUIRED',
      isIotEnabled: true,
      lastTelemetryAt: new Date().toISOString(),
      healthScore: 45,
      healthStatus: 'POOR',
      efficiencyScore: 52,
      isRunning: false,
      openAlerts: 3,
      lastMaintenanceDate: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
};

export const NoIoT: Story = {
  args: {
    equipment: {
      id: '5',
      name: 'Presser #1',
      type: 'PRESSER',
      status: 'OPERATIONAL',
      isIotEnabled: false,
      isRunning: false,
      openAlerts: 0,
    },
  },
};

export const CriticalHealth: Story = {
  args: {
    equipment: {
      id: '6',
      name: 'Air Compressor #1',
      type: 'AIR_COMPRESSOR',
      status: 'MAINTENANCE_REQUIRED',
      isIotEnabled: true,
      lastTelemetryAt: new Date().toISOString(),
      healthScore: 25,
      healthStatus: 'CRITICAL',
      efficiencyScore: 30,
      isRunning: false,
      openAlerts: 5,
      lastMaintenanceDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
};
