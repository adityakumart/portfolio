import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adityakumar.portfolio',
  appName: 'User Workspace',
  webDir: '../../dist/apps/portfolio/browser',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
