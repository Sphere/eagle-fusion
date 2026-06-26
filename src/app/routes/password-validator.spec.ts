import { mustMatch } from './password-validator'

function makeFormGroup(controlValue: string, matchingValue: string, matchingErrors: any = null) {
  const matchingControl = {
    value: matchingValue,
    errors: matchingErrors,
    setErrors: jest.fn(),
  }
  return {
    controls: {
      password: { value: controlValue },
      confirmPassword: matchingControl,
    },
    _matchingControl: matchingControl,
  } as any
}

describe('mustMatch validator', () => {
  it('sets null on matchingControl when values match', () => {
    const fg = makeFormGroup('secret', 'secret')
    const validator = mustMatch('password', 'confirmPassword')
    validator(fg)
    expect(fg._matchingControl.setErrors).toHaveBeenCalledWith(null)
  })

  it('sets { mustMatch: true } when values do not match', () => {
    const fg = makeFormGroup('secret', 'different')
    const validator = mustMatch('password', 'confirmPassword')
    validator(fg)
    expect(fg._matchingControl.setErrors).toHaveBeenCalledWith({ mustMatch: true })
  })

  it('returns early without calling setErrors when matchingControl has unrelated errors', () => {
    const fg = makeFormGroup('abc', 'abc', { required: true })
    const validator = mustMatch('password', 'confirmPassword')
    validator(fg)
    expect(fg._matchingControl.setErrors).not.toHaveBeenCalled()
  })

  it('does not short-circuit when matchingControl already has mustMatch error', () => {
    const fg = makeFormGroup('abc', 'xyz', { mustMatch: true })
    const validator = mustMatch('password', 'confirmPassword')
    validator(fg)
    expect(fg._matchingControl.setErrors).toHaveBeenCalledWith({ mustMatch: true })
  })

  it('returns a function', () => {
    expect(typeof mustMatch('a', 'b')).toBe('function')
  })
})
