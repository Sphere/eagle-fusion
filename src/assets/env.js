// Runtime environment config — overridden by deployment (Docker/Kubernetes).
// These defaults allow the app to start without crashing when env.js is not injected.
(function (window) {
  window.env = window.env || {};
  window.env.name = window.env.name || '';
  window.env.production = window.env.production !== undefined ? window.env.production : false;
  window.env.sitePath = window.env.sitePath || '';
  window.env.organisation = window.env.organisation || '';
  window.env.framework = window.env.framework || '';
  window.env.channelId = window.env.channelId || '';
  window.env.azureHost = window.env.azureHost || '';
  window.env.contentHost = window.env.contentHost || '';
  window.env.azureBucket = window.env.azureBucket || '';
  window.env.azureOldHost = window.env.azureOldHost || '';
  window.env.azureOldBuket = window.env.azureOldBuket || '';
}(window));
