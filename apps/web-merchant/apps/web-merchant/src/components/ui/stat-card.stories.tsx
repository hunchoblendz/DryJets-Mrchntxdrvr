import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './stat-card';
import { Activity, AlertTriangle, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: 'Total Equipment',
    value: 42,
    icon: Zap,
    variant: 'default',
  },
};

export const WithTrendUp: Story = {
  args: {
    title: 'IoT Enabled',
    value: 35,
    icon: Activity,
    variant: 'info',
    trend: 12,
  },
};

export const WithTrendDown: Story = {
  args: {
    title: 'Efficiency',
    value: 78,
    suffix: '%',
    icon: TrendingDown,
    variant: 'warning',
    trend: -5,
  },
};

export const Success: Story = {
  args: {
    title: 'Running Equipment',
    value: 28,
    icon: TrendingUp,
    variant: 'success',
    trend: 8,
  },
};

export const Warning: Story = {
  args: {
    title: 'Open Alerts',
    value: 3,
    icon: AlertTriangle,
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    title: 'Critical Issues',
    value: 1,
    icon: AlertTriangle,
    variant: 'error',
  },
};

export const WithPrefix: Story = {
  args: {
    title: 'Monthly Revenue',
    value: 12500,
    prefix: '$',
    icon: TrendingUp,
    variant: 'success',
    trend: 15,
  },
};

export const WithDecimals: Story = {
  args: {
    title: 'Average Health',
    value: 87.5,
    suffix: '%',
    decimals: 1,
    icon: Activity,
    variant: 'success',
  },
};
