import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aastrika.sphere',
  appName: 'Sphere',
  webDir: 'dist/www/en',
  bundledWebRuntime: false,
  server : {
    url : "https://sphere.aastrika.org"
  }
};

export default config;
