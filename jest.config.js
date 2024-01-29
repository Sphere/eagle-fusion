// require('jest-preset-angular/ngcc-jest-processor');

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
    "^@ws-widget/collection$": '<rootDir>/library/ws-widget/collection/src/public-api.ts',
    "^@ws-widget/resolver$": '<rootDir>/library/ws-widget/resolver',
    '^@ws-widget/utils/src/lib/services/configurations.service$': '<rootDir>/library/ws-widget/collection/src/lib/_services/widget-content.service.ts',
    '^@ws/app/src/lib/routes/search/apis/search-api.service$': '<rootDir>/library/ws-widget/collection/src/lib/btn-feature/btn-feature.component.ts',
    '^project/ws/author/src/lib/modules/shared/services/api.service$': '<rootDir>/library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.services.ts',
    '^@ws/author/src/lib/constants/upload': '<rootDir>/library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.services.ts',
    '^@ws/author/src/lib/constants/apiEndpoints': '<rootDir>/library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.services.ts',
    '^@ws/author/src/lib/modules/shared/services/access-control.service$': '<rootDir>/library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.services.ts',
    '^@ws/app/src/lib/routes/search/services/search-serv.service$': '<rootDir>/library/ws-widget/collection/src/lib/picker-content/picker-content.component.ts',
    '^project/ws/viewer/src/lib/viewer-data.service': '<rootDir>/library/ws-widget/collection/src/lib/player-video/player-video.component.ts',
    '^project/ws/app/src/lib/routes/user-profile/services/user-profile.service': '<rootDir>/library/ws-widget/collection/src/lib/btn-profile/btn-profile.component.ts',
    '@ws-widget/resolver/src/public-api$': '<rootDir>/library/ws-widget/collection/src/lib/btn-profile/btn-profile.module.ts'
  }
}
