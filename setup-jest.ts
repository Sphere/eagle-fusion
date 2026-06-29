import 'jest-preset-angular/setup-jest'
import '@angular/localize/init'

Object.defineProperty(window, 'fcWidget', {
  value: {
    init: jest.fn(),
    setConfig: jest.fn(),
  },
  writable: true,
})

Object.defineProperty(global.URL, 'createObjectURL', {
  value: jest.fn(),
  writable: true,
})
