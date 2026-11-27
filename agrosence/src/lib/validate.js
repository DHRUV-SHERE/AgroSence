/**
 * Client-side validators mirroring the server rules in docs/API_CONTRACT.md.
 * Each validator returns an error string, or '' when valid.
 *
 *   import { rules, validate } from '../lib/validate'
 *   const errors = validate(values, { email: [rules.required('Email'), rules.email], password: [rules.password] })
 *   // errors -> { email: '...', password: '...' } (only failing fields)
 */
export const MOBILE_RE = /^[0-9]{10}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const LANGUAGES = ['English', 'Hindi', 'Gujarati']

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Puducherry', 'Chandigarh',
]

export const rules = {
  required: (label = 'This field') => (v) => (String(v ?? '').trim() ? '' : `${label} is required.`),
  email: (v) => (!v || EMAIL_RE.test(String(v).trim()) ? '' : 'Enter a valid email address.'),
  mobile: (v) => (!v || MOBILE_RE.test(String(v).trim()) ? '' : 'Enter a 10-digit mobile number.'),
  /** mobile OR email, for the login identifier */
  identifier: (v) => {
    const s = String(v ?? '').trim()
    return MOBILE_RE.test(s) || EMAIL_RE.test(s) ? '' : 'Enter your 10-digit mobile number or email.'
  },
  /** >= 8 chars, at least one letter and one number */
  password: (v) =>
    !v || (String(v).length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v))
      ? ''
      : 'Use at least 8 characters with a letter and a number.',
  minLength: (n, label = 'This field') => (v) => (!v || String(v).trim().length >= n ? '' : `${label} must be at least ${n} characters.`),
  match: (otherKey, label = 'Passwords') => (v, all) => (v === all[otherKey] ? '' : `${label} do not match.`),
  oneOf: (list, label = 'Choice') => (v) => (!v || list.includes(v) ? '' : `Choose a valid ${label.toLowerCase()}.`),
  otp: (v) => (/^\d{4,8}$/.test(String(v ?? '').trim()) ? '' : 'Enter the code we emailed you.'),
}

export function validate(values, schema) {
  const errors = {}
  for (const [field, list] of Object.entries(schema)) {
    for (const rule of list) {
      const msg = rule(values[field], values)
      if (msg) { errors[field] = msg; break }
    }
  }
  return errors
}
