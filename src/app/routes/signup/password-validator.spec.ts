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

describe('mustMatch validator (signup)', () => {
  it('sets null on matchingControl when values match', () => {
    const fg = makeFormGroup('pass123', 'pass123')
    mustMatch('password', 'confirmPassword')(fg)
    expect(fg._matchingControl.setErrors).toHaveBeenCalledWith(null)
  })

  it('sets { mustMatch: true } when values do not match', () => {
    const fg = makeFormGroup('pass123', 'wrong')
    mustMatch('password', 'confirmPassword')(fg)
    expect(fg._matchingControl.setErrors).toHaveBeenCalledWith({ mustMatch: true })
  })

  it('returns early if matchingControl has other errors (not mustMatch)', () => {
    const fg = makeFormGroup('abc', 'abc', { required: true })
    mustMatch('password', 'confirmPassword')(fg)
    expect(fg._matchingControl.setErrors).not.toHaveBeenCalled()
  })

  it('processes normally when matchingControl errors object only has mustMatch key', () => {
    const fg = makeFormGroup('abc', 'xyz', { mustMatch: true })
    mustMatch('password', 'confirmPassword')(fg)
    expect(fg._matchingControl.setErrors).toHaveBeenCalledWith({ mustMatch: true })
  })
})
