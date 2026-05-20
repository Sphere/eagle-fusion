// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const _env = (window as { [key: string]: any })['env'] || {}

export const environment: IEnvironment = {
  name: _env['name'] || '',
  production: false,
  sitePath: _env['sitePath'] || '',
  organisation: _env['organisation'] || '',
  framework: _env['framework'] || '',
  channelId: _env['channelId'] || '',
  azureHost: _env['azureHost'] || '',
  contentHost: _env['contentHost'] || '',
  azureBucket: _env['azureBucket'] || '',
  azureOldHost: _env['azureOldHost'] || '',
  azureOldBuket: _env['azureOldBuket'] || '',
}
interface IEnvironment {
  name: string,
  production: boolean
  sitePath: null | string
  organisation: string
  framework: string
  channelId: string,
  azureHost: string,
  azureBucket: string,
  azureOldHost: string,
  azureOldBuket: string
  contentHost: string
}
