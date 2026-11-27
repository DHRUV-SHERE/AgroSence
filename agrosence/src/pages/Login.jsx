/** Login: identifier (10-digit mobile OR email) + password -> POST /auth/login via useAuth().login */
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { rules, validate } from '../lib/validate'
import { Alert, Button, Checkbox, Input, PasswordInput } from '../components/ui'
import AuthShell from '../components/AuthShell'
import art from '../assets/home/auth-login.webp'

const remembered = () => { try { return localStorage.getItem('agro_remember_id') || '' } catch { return '' } }

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState(() => ({ identifier: remembered(), password: '' }))
  const [remember, setRemember] = useState(() => Boolean(remembered()))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(values, {
      identifier: [rules.required('Mobile number or email'), rules.identifier],
      password: [rules.required('Password')],
    })
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      await login({ ...values, remember })
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.status === 401 ? 'That mobile number or email and password do not match. Please check and try again.' : err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell art={art} quote="Good soil, good crop, fair price." note="Sign in to manage your listings and orders.">
      <h1>Welcome back</h1>
      <p>Log in with your mobile number or email.</p>
      <form className="ag-form" onSubmit={submit} noValidate style={{ marginTop: 'var(--s-5)' }}>
        <Input label="Mobile number or email" name="identifier" value={values.identifier} onChange={set} error={errors.identifier} autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
        <PasswordInput label="Password" name="password" value={values.password} onChange={set} error={errors.password} autoComplete="current-password" required />
        <div className="ag-rowbetween">
          <Checkbox label="Remember my mobile or email" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <Link to="/forgot-password" className="ag-tap" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>Forgot password?</Link>
        </div>
        {serverError && <Alert tone="danger">{serverError}</Alert>}
        <Button type="submit" variant="primary" size="lg" block loading={busy}>{busy ? 'Logging in' : 'Log in'}</Button>
      </form>
      <p className="ag-auth__foot">New to AgroSense? <Link to="/signup" style={{ fontWeight: 600 }}>Create an account</Link></p>
    </AuthShell>
  )
}
