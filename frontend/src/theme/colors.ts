export const colors = {
  primary: '#007AFF',
  secondary: '#34C759',
  danger: '#FF3B30',
  grey: {
    100: '#f8f8f8',
    200: '#f5f5f5',
    300: '#eee',
    400: '#ddd',
    500: '#999',
    600: '#666',
    700: '#444',
  },
  white: '#fff',
  black: '#000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  cancel: '#8E8E93',
} as const;

export type ColorKeys = keyof typeof colors;
