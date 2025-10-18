import type { Meta, StoryObj } from '@storybook/react';
import { Progress, CircularProgress } from './progress';

const LinearMeta: Meta<typeof Progress> = {
  title: 'UI/Progress/Linear',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default LinearMeta;
type LinearStory = StoryObj<typeof Progress>;

export const Linear25: LinearStory = {
  args: {
    value: 25,
  },
};

export const Linear50: LinearStory = {
  args: {
    value: 50,
  },
};

export const Linear75: LinearStory = {
  args: {
    value: 75,
  },
};

export const Linear100: LinearStory = {
  args: {
    value: 100,
  },
};

const CircularMeta: Meta<typeof CircularProgress> = {
  title: 'UI/Progress/Circular',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

type CircularStory = StoryObj<typeof CircularProgress>;

export const CircularExcellent: CircularStory = {
  args: {
    value: 92,
    size: 120,
    showValue: true,
    label: '%',
  },
};

export const CircularGood: CircularStory = {
  args: {
    value: 78,
    size: 120,
    showValue: true,
    label: '%',
  },
};

export const CircularFair: CircularStory = {
  args: {
    value: 55,
    size: 120,
    showValue: true,
    label: '%',
  },
};

export const CircularPoor: CircularStory = {
  args: {
    value: 32,
    size: 120,
    showValue: true,
    label: '%',
  },
};

export const CircularEco: CircularStory = {
  args: {
    value: 85,
    size: 120,
    variant: 'eco',
    showValue: true,
    label: '%',
  },
};

export const CircularLarge: CircularStory = {
  args: {
    value: 88,
    size: 160,
    strokeWidth: 12,
    showValue: true,
    label: '%',
  },
};

export const CircularSmall: CircularStory = {
  args: {
    value: 65,
    size: 80,
    strokeWidth: 6,
    showValue: true,
    label: '%',
  },
};
