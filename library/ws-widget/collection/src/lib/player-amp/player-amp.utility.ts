/// <reference types="azuremediaplayer" />

const ampDefaultConfig: amp.Player.Options = {
  techOrder: ['azureHtml5JS', 'flashSS', 'html5FairPlayHLS', 'silverlightSS', 'html5'],
  nativeControlsForTouch: false,
  autoplay: true,
  controls: true,
  width: '100%',
  height: '100%',
  poster: '',
  logo: { enabled: false },
  playbackSpeed: {
    enabled: true,
    initialSpeed: 1.0,
    speedLevels: [
      { name: 'x3.0', value: 3.0 },
      { name: 'x2.0', value: 2.0 },
      { name: 'x1.25', value: 1.25 },
      { name: 'x1.0', value: 1.0 },
      { name: 'x0.85', value: 0.85 },
      { name: 'x0.75', value: 0.75 },
    ],
  },
}

const BASE = {
  amp: 'https://amp.azure.net/libs/amp/2.3.0',
  assets: '/public-assets/',
}
export const LINKS = {
  base: 'https://amp.azure.net/libs/amp/2.3.0',
  ampScript: `${BASE.amp}/azuremediaplayer.min.js`,
  ampCSS: `${BASE.amp}/skins/amp-flush/azuremediaplayer.min.css`,
  ampPluginMarkerScript: `${BASE.assets}`,
  ampPluginMarkerCSS: `${BASE.assets}`,
  ampProxy: 'https://cvprsg101v.cloudvideo.azure.net/api/ManifestProxy',
}

export function getAmpConfig(
  poster?: string,
  markers: string[] = [],
  autoplay: boolean = true,
): amp.Player.Options {
  const config = { ...ampDefaultConfig, autoplay, poster }
  if (markers.length) {
    config.plugins = {
      timelineMarker: {
        markertime: markers,
      },
    }
  }
  return config
}

export function isIOS(): boolean {
  return true
}
