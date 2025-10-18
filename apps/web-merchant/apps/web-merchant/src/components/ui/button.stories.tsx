import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Plus, Trash, Download } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const BrandGradient: Story = {
  args: {
    children: 'Brand Gradient',
    className: 'bg-brand-gradient hover:opacity-90',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="h-4 w-4 mr-2" />
        Add Equipment
      </>
    ),
    className: 'bg-brand-gradient hover:opacity-90',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <Trash className="h-4 w-4 mr-2" />
        Delete
      </>
    ),
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Icon: Story = {
  args: {
    variant: 'ghost',
    size: 'icon',
    children: <Download className="h-4 w-4" />,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
    className: 'bg-brand-gradient hover:opacity-90 shadow-lift',
  },
};
