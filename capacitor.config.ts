import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1e2e4cbf977a48ea974c5af647ee13a3',
  appName: 'Linguo',
  webDir: 'dist',
  server: {
    url: 'https://1e2e4cbf-977a-48ea-974c-5af647ee13a3.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
