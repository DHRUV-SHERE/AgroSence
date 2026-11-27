/**
 * Password reset (contract): POST /auth/send-otp {email} (always 200, no user enumeration),
 * then POST /auth/reset-password {email, otp, newPassword}.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { http } from '../lib/api'
import { rules, validate } from '../lib/validate'
import { Alert, Button, Input, PasswordInput, useToast } from '../components/ui'
import AuthShell from '../components/AuthShell'
import art from '../assets/auth-register.webp'

const COOLDOWN = 60 // matches the server: one code per email per 60 s

export default function ForgotPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [values, setValues] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (wait <= 0) return undefined
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const set = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: name === 'otp' ? value.replace(/\D/g, '') : value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }))
  }

  const sendOtp = async (e) => {
    e?.preventDefault()
    const found = validate(values, { email: [rules.required('Email'), rules.email] })
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      await http.post('/auth/send-otp', { email: values.email.trim() })
      setStep(2)
      setWait(COOLDOWN)
      toast.info('If that email is registered, a code is on its way.')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const reset = async (e) => {
    e.preventDefault()
    const found = validate(values, {
      otp: [rules.otp],
      newPassword: [rules.required('New password'), rules.password],
      confirmPassword: [rules.required('Please confirm your password'), rules.match('newPassword')],
    })
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      await http.post('/auth/reset-password', { email: values.email.trim(), otp: values.otp, newPassword: values.newPassword })
      toast.success('Password updated. Please log in with your new password.')
      navigate('/login', { replace: true })
    } catch (err) {
      setErrors(err.fieldErrors || {})
      setServerError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell art={art} quote="Locked out? It happens to everyone." note="We will email you a one-time code.">
      <h1>Reset your password</h1>
      {step === 1 ? (
        <>
          <p>Enter the email on your account and we will send a 10-minute code.</p>
          <form className="ag-form" onSubmit={sendOtp} noValidate style={{ marginTop: 'var(--s-5)' }}>
            <Input label="Email" name="email" type="email" value={values.email} onChange={set} error={errors.email} autoComplete="email" autoCapitalize="none" required autoFocus />
            {serverError && <Alert tone="danger">{serverError}</Alert>}
            <Button type="submit" variant="primary" size="lg" block loading={busy}>{busy ? 'Sending code' : 'Send code'}</Button>
          </form>
        </>
      ) : (
        <>
          <p>We sent a code to <strong>{values.email}</strong>. It expires in 10 minutes.</p>
          <form className="ag-form" onSubmit={reset} noValidate style={{ marginTop: 'var(--s-5)' }}>
            <Input label="One-time code" name="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={values.otp} onChange={set} error={errors.otp} required autoFocus />
            <PasswordInput label="New password" name="newPassword" value={values.newPassword} onChange={set} error={errors.newPassword} help="At least 8 characters, with a letter and a number" autoComplete="new-password" required />
            <PasswordInput label="Confirm new password" name="confirmPassword" value={values.confirmPassword} onChange={set} error={errors.confirmPassword} autoComplete="new-password" required />
            {serverError && <Alert tone="danger">{serverError}</Alert>}
            <Button type="submit" variant="primary" size="lg" block loading={busy}>{busy ? 'Updating' : 'Update password'}</Button>
            <div className="ag-rowbetween">
              <Button variant="ghost" size="sm" onClick={() => { setStep(1); setServerError('') }}>Use a different email</Button>
              <Button variant="ghost" size="sm" disabled={wait > 0 || busy} onClick={sendOtp}>{wait > 0 ? `Resend in ${wait}s` : 'Resend code'}</Button>
            </div>
          </form>
        </>
      )}
      <p className="ag-auth__foot">Remembered it? <Link to="/login" style={{ fontWeight: 600 }}>Back to log in</Link></p>
    </AuthShell>
  )
}
