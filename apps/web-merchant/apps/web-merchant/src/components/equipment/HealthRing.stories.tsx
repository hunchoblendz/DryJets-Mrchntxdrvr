import type { Meta, StoryObj } from '@storybook/react';
import { HealthRing } from './HealthRing';

const meta: Meta<typeof HealthRing> = {
  title: 'Equipment/HealthRing',
  component: HealthRing,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 80, max: 200, step: 10 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HealthRing>;

export const Excellent: Story = {
  args: {
    score: 95,
    status: 'EXCELLENT',
    size: 120,
  },
};

export const Good: Story = {
  args: {
    score: 85,
    status: 'GOOD',
    size: 120,
  },
};

export const Fair: Story = {
  args: {
    score: 65,
    status: 'FAIR',
    size: 120,
  },
};

export const Poor: Story = {
  args: {
    score: 42,
    status: 'POOR',
    size: 120,
  },
};

export const Critical: Story = {
  args: {
    score: 18,
    status: 'CRITICAL',
    size: 120,
  },
};

export const Large: Story = {
  args: {
    score: 88,
    size: 160,
  },
};

export const Small: Story = {
  args: {
    score: 76,
    size: 90,
  },
};

export const WithoutLabel: Story = {
  args: {
    score: 92,
    showLabel: false,
    size: 120,
  },
};
