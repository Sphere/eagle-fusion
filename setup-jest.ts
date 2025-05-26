import 'jest-preset-angular/setup-jest'

// filepath: src/setup-jest.ts
Object.defineProperty(window, 'fcWidget', {
  value: {
    init: jest.fn(),
    setConfig: jest.fn(),
  },
  writable: true,
})