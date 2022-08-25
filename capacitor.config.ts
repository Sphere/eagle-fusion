import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aastrika.sphere',
  appName: 'Aastrika Sphere',
  webDir: 'dist/www/hi',
  bundledWebRuntime: false,
  server: {
    url: 'https://sphere.aastrika.org/hi',
    cleartext: true
  },
};

export default config;
