export abstract class WindowRef {
  get nativeWindow(): Window | Object {
    throw new Error('Window not available.')
  }
}
