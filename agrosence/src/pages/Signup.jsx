/**
 * Signup in 3 short steps. Fields and validation mirror the contract (POST /auth/signup):
 * name, mobile (10 digits), email, password (>=8, letter+number), confirmPassword, state, address, language.
 * Server field errors are mapped back onto the right step.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { INDIAN_STATES, LANGUAGES, rules, validate } from '../lib/validate'
import { Alert, Button, Input, PasswordInput, Select, Textarea, useToast } from '../components/ui'
import AuthShell from '../components/AuthShell'
import art from '../assets/auth-register.webp'

const STEPS = [
  { title: 'About you', fields: ['name', 'mobile', 'email'] },
  { title: 'Your farm', fields: ['state', 'address', 'language'] },
  { title: 'Secure your account', fields: ['password', 'confirmPassword'] },
]
const SCHEMA = {
  name: [rules.required('Your name'), rules.minLength(2, 'Your name')],
  mobile: [rules.required('Mobile number'), rules.mobile],
  email: [rules.required('Email'), rules.email],
  state: [rules.required('State')],
  address: [rules.required('Address'), rules.minLength(5, 'Address')],
  language: [rules.required('Language'), rules.oneOf(LANGUAGES, 'language')],
  password: [rules.required('Password'), rules.password],
  confirmPassword: [rules.required('Please confirm your password'), rules.match('password')],
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState({ name: '', mobile: '', email: '', state: '', address: '', language: 'English', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: name === 'mobile' ? value.replace(/\D/g, '') : value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }))
  }

  const checkStep = (i) => {
    const schema = Object.fromEntries(STEPS[i].fields.map((f) => [f, SCHEMA[f]]))
    const found = validate(values, schema)
    setErrors((er) => ({ ...er, ...found }))
    return !Object.keys(found).length
  }

  const next = (e) => {
    e.preventDefault()
    if (checkStep(step)) setStep((s) => s + 1)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!checkStep(step)) return
    setBusy(true)
    setServerError('')
    try {
      const user = await signup({ ...values, name: values.name.trim(), email: values.email.trim(), address: values.address.trim() })
      toast.success(`Welcome to AgroSense, ${user.name?.split(' ')[0] || 'friend'}.`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors(err.fieldErrors || {})
      setServerError(err.message)
      const bad = STEPS.findIndex((s) => s.fields.some((f) => err.fieldErrors?.[f]))
      if (bad >= 0) setStep(bad)
      setBusy(false)
    }
  }

  const last = step === STEPS.length - 1
  return (
    <AuthShell art={art} quote="Join us and grow your farm." note="Free for farmers and buyers.">
      <h1>Create your account</h1>
      <ol className="ag-steps" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => <li key={s.title} data-done={i <= step} />)}
      </ol>
      <p style={{ marginBottom: 'var(--s-4)', fontWeight: 600, color: 'var(--ink)' }}>Step {step + 1} of {STEPS.length}: {STEPS[step].title}</p>

      <form className="ag-form" onSubmit={last ? submit : next} noValidate>
        {step === 0 && (
          <>
            <Input label="Full name" name="name" value={values.name} onChange={set} error={errors.name} autoComplete="name" required autoFocus />
            <Input label="Mobile number" name="mobile" type="tel" inputMode="numeric" maxLength={10} value={values.mobile} onChange={set} error={errors.mobile} help="10 digits, no country code" autoComplete="tel-national" required />
            <Input label="Email" name="email" type="email" value={values.email} onChange={set} error={errors.email} autoComplete="email" autoCapitalize="none" required />
          </>
        )}
        {step === 1 && (
          <>
            <Select label="State" name="state" options={INDIAN_STATES} placeholder="Choose your state" value={values.state} onChange={set} error={errors.state} autoComplete="address-level1" required />
            <Textarea label="Address" name="address" rows={3} value={values.address} onChange={set} error={errors.address} help="Village or town, district" autoComplete="street-address" required />
            <Select label="Preferred language" name="language" options={LANGUAGES} value={values.language} onChange={set} error={errors.language} required />
          </>
        )}
        {step === 2 && (
          <>
            <PasswordInput label="Password" name="password" value={values.password} onChange={set} error={errors.password} help="At least 8 characters, with a letter and a number" autoComplete="new-password" required autoFocus />
            <PasswordInput label="Confirm password" name="confirmPassword" value={values.confirmPassword} onChange={set} error={errors.confirmPassword} autoComplete="new-password" required />
          </>
        )}
        {serverError && <Alert tone="danger">{serverError}</Alert>}
        <div className="ag-rowbetween">
          {step > 0 ? <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Button> : <span />}
          <Button type="submit" variant="primary" size="lg" loading={busy}>{last ? (busy ? 'Creating account' : 'Create account') : 'Continue'}</Button>
        </div>
      </form>
      <p className="ag-auth__foot">Already registered? <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link></p>
    </AuthShell>
  )
}
