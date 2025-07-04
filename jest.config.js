globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json', // this is the project root tsconfig
}

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'], // Ensure this path is correct
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!flat)/',
  ],
  testEnvironmentOptions: {
    url: "http://localhost",
    resources: 'usable',
  },
  coverageDirectory: '<rootDir>/coverage/',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "project/ws/**/*.ts",
    "library/ws-widget/**/*.ts",
    "!src/**/*.spec.ts",  // Ensure spec files are excluded
    "!src/main.ts",        // Exclude main.ts if needed
    "!src/polyfills.ts",   // Exclude polyfills
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/', // Exclude node_modules
    'src/.*\\.spec\\.ts$', // Exclude spec files using a valid regex
    'project/.*\\.spec\\.ts$', // Exclude spec files in project folder
    'library/.*\\.spec\\.ts$', // Exclude spec files in library folder
  ],
  moduleDirectories: ['node_modules', 'src'],
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
    '@ws-widget/resolver/src/public-api$': '<rootDir>/library/ws-widget/resolver/src/public-api.ts',
    '@ws/app/src/lib/routes/user-profile/models/NsUserProfile': '<rootDir>/project/ws/app/src/lib/routes/user-profile/models/NsUserProfile.ts',
    '^library/ws-widget/utils/src/lib/services/auth-keycloak.service': '<rootDir>/library/ws-widget/utils/src/lib/services/auth-keycloak.service.ts',
    '@ws-widget/utils/src/public-api': '<rootDir>/library/ws-widget/utils/src/public-api.ts',
    '@ws/author/src/lib/routing/modules/home/home.module': '<rootDir>/project/ws/author/src/lib/routing/modules/home/home.module.ts',
    '@ws/author/src/lib/modules/shared/shared.module': '<rootDir>/project/ws/author/src/lib/modules/shared/shared.module.ts',
    '@ws/author/src/lib/modules/shared/services/condition-check.service': '<rootDir>/project/ws/author/src/lib/modules/shared/services/condition-check.service.ts',
    '@ws/author/src/lib/services/init.service': '<rootDir>/project/ws/author/src/lib/services/init.service.ts',
    '@ws/author/src/lib/constants/notificationMessage': '<rootDir>/project/ws/author/src/lib/constants/notificationMessage.ts',
    '@ws/author/src/lib/services/notification.service': '<rootDir>/project/ws/author/src/lib/services/notification.service.ts',

    '@ws/author/src/lib/modules/shared/services/api.service': '<rootDir>/project/ws/author/src/lib/modules/shared/services/api.service.ts',
    '@ws/author/src/lib/constants/constant': '<rootDir>/project/ws/author/src/lib/constants/constant.ts',
    '@ws/author/src/lib/modules/shared/components/notification/notification.component': '<rootDir>/project/ws/author/src/lib/constants/notificationMessage.ts',
    '@ws/author/src/lib/services/work-flow.service': '<rootDir>/project/ws/author/src/lib/services/work-flow.service.ts',
    '@ws/author/src/lib/services/loader.service': '<rootDir>/project/ws/author/src/lib/services/loader.service.ts',
    '@ws-widget/collection/src/public-api': '<rootDir>/library/ws-widget/collection/src/public-api.ts',
    '@ws/author/src/lib/services/auth-nav-bar-toggle.service': '<rootDir>/project/ws/author/src/lib/services/auth-nav-bar-toggle.service.ts',
    '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service': '<rootDir>/project/ws/author/src/lib/routing/modules/editor/shared/services/upload.service.ts',
    '@ws-widget/collection/src/lib/_services/widget-content.model': '<rootDir>/library/ws-widget/collection/src/lib/_services/widget-content.model.ts',
    '@ws-widget/collection/src/lib/_constants/widget-content.constants': '<rootDir>/library/ws-widget/collection/src/lib/_constants/widget-content.constants.ts',
    '@ws/author/src/public-api': '<rootDir>/project/ws/author/src/public-api.ts',
    '@ws/author$': '<rootDir>/project/ws/author/src/public-api.ts',
    '@ws-widget/utils/src/lib/services/utility.service': '<rootDir>/library/ws-widget/utils/src/lib/services/utility.service.ts',
    '^project/ws/app/src/lib/routes/org/org-service.service': '<rootDir>/project/ws/app/src/lib/routes/org/org-service.service.ts'

  }
}