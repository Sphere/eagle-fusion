import { EmailMobileValidators } from './emailMobile.validator'

const makeControl = (userInput: string) => ({
  value: { userInput },
})

describe('EmailMobileValidators.combinePattern', () => {
  it('returns null when userInput is absent', () => {
    const control: any = { value: {} }
    expect(EmailMobileValidators.combinePattern(control)).toBeNull()
  })

  it('returns null for a valid email address', () => {
    expect(EmailMobileValidators.combinePattern(makeControl('user@example.com') as any)).toBeNull()
  })

  it('returns null for a valid 10-digit mobile number', () => {
    expect(EmailMobileValidators.combinePattern(makeControl('9876543210') as any)).toBeNull()
  })

  it('returns { email: false } when email is 100+ characters long', () => {
    const longEmail = 'a'.repeat(90) + '@example.com'
    expect(EmailMobileValidators.combinePattern(makeControl(longEmail) as any)).toEqual({ email: false })
  })

  it('returns { mobile: false } when mobile number has fewer than 10 digits', () => {
    expect(EmailMobileValidators.combinePattern(makeControl('98765') as any)).toEqual({ mobile: false })
  })

  it('returns { mobile: false } when mobile number has more than 10 digits', () => {
    expect(EmailMobileValidators.combinePattern(makeControl('98765432101') as any)).toEqual({ mobile: false })
  })

  it('returns null for input that is neither email nor mobile (arbitrary text)', () => {
    expect(EmailMobileValidators.combinePattern(makeControl('hello world') as any)).toBeNull()
  })

  it('returns null for empty string input', () => {
    expect(EmailMobileValidators.combinePattern(makeControl('') as any)).toBeNull()
  })

  it('returns null for a valid email exactly under 100 characters', () => {
    const email = 'a'.repeat(80) + '@b.com'
    expect(EmailMobileValidators.combinePattern(makeControl(email) as any)).toBeNull()
  })
})
