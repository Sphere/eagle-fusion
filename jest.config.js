globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json', // this is the project root tsconfig
}

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: {
    '^@ws-widget/utils$': '<rootDir>/library/ws-widget/utils/src/lib/services/configurations.service.ts',
    '^@ws-widget/collection$': '<rootDir>/library/ws-widget/collection/src/public-api.ts',
    '^@ws-widget/resolver$': '<rootDir>/library/ws-widget/resolver/src/public-api.ts',
    '^@ws-widget/utils/src/lib/services/configurations.service$': '<rootDir>/library/ws-widget/utils/src/lib/services/configurations.service.ts',
    '^@ws/app/src/lib/routes/search/apis/search-api.service$': '<rootDir>/project/ws/app/src/lib/routes/search/apis/search-api.service.ts',
    '^project/ws/author/src/lib/modules/shared/services/api.service': '<rootDir>/project/ws/author/src/lib/modules/shared/services/api.service.ts',
    '^@ws/author/src/lib/constants/upload$': '<rootDir>/project/ws/author/src/lib/constants/upload.ts',
    '^@ws/author/src/lib/constants/apiEndpoints$': '<rootDir>/project/ws/author/src/lib/constants/apiEndpoints.ts',
    '^@ws/author/src/lib/modules/shared/services/access-control.service$': '<rootDir>/project/ws/author/src/lib/modules/shared/services/access-control.service.ts',
    '^@ws/author/src/lib/constants/icons$': '<rootDir>/project/ws/author/src/lib/constants/icons.ts',
    '^@ws/author/src/lib/constants/mimeType$': '<rootDir>/project/ws/author/src/lib/constants/mimeType.ts',
    '^@ws/app/src/lib/routes/search/services/search-serv.service$': '<rootDir>/project/ws/app/src/lib/routes/search/services/search-serv.service.ts',
    '^project/ws/viewer/src/lib/viewer-data.service': '<rootDir>/project/ws/viewer/src/lib/viewer-data.service.ts',
    '^project/ws/app/src/lib/routes/user-profile/services/user-profile.service': '<rootDir>/project/ws/app/src/lib/routes/user-profile/services/user-profile.service.ts',
    '@ws-widget/resolver/src/public-api$': '<rootDir>/library/ws-widget/resolver/src/public-api.ts'

  }
}