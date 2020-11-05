import { PipeSafeSanitizerPipe } from './pipe-safe-sanitizer.pipe'

describe('PipeSafeSanitizerPipe', () => {
  it('create an instance', () => {
    const pipe = new PipeSafeSanitizerPipe()
    expect(pipe).toBeTruthy()
  })
})
