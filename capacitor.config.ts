import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.aastrika.sphere',
  appName: 'Sphere',
  webDir: 'dist/www/en',
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
    "allowNavigation": [
      "*"
    ]
  }
}

export default config
