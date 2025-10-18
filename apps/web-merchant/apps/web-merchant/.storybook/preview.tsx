import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/components/theme-provider';
import '../src/app/globals.css';
import React from 'react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0a0a0a',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light" storageKey="storybook-ui-theme">
        <div className="p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
