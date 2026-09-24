import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adityakumar.portfoliorr',
  appName: 'RR Fleet Management',
  webDir: '../../dist/apps/portfolio-rr/browser',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
