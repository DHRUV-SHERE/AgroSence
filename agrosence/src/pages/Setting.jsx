/**
 * Settings (AppLayout). Profile -> PUT /auth/me (whitelist: name, email, mobile, state, address, language, avatar),
 * password -> useAuth().changePassword (sends the refresh token so this session stays valid, others are signed out),
 * theme (local), sign out. Changing email or mobile asks for the current password (sent as `currentPassword`).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuLogOut, LuMoon, LuMonitor, LuSun } from 'react-icons/lu'
import '../styles/pages-tools.css'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { INDIAN_STATES, LANGUAGES, rules, validate } from '../lib/validate'
import { Alert, Avatar, Button, Card, ConfirmDialog, Input, PasswordInput, Select, Textarea, useToast } from '../components/ui'

const httpUrl = (v) => (!v || /^https?:\/\/\S+$/i.test(String(v).trim()) ? '' : 'Use a full link that starts with https://')

const PROFILE_RULES = {
  name: [rules.required('Name'), rules.minLength(2, 'Name')],
  email: [rules.required('Email'), rules.email],
  mobile: [rules.required('Mobile number'), rules.mobile],
  state: [rules.oneOf(INDIAN_STATES, 'state')],
  language: [rules.oneOf(LANGUAGES, 'language')],
  address: [rules.minLength(5, 'Address')],
  avatar: [httpUrl],
}

const PASSWORD_RULES = {
  currentPassword: [rules.required('Current password')],
  newPassword: [rules.required('New password'), rules.password],
  confirmPassword: [rules.required('Confirmation'), rules.match('newPassword', 'Passwords')],
}

const toForm = (u) => ({
  name: u?.name || '', email: u?.email || '', mobile: u?.mobile || '', state: u?.state || '',
  language: u?.language || 'English', address: u?.address || '', avatar: u?.avatar || '',
})

function ProfileSection() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(() => toForm(user))
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const base = toForm(user)
  const sensitive = form.email.trim() !== base.email || form.mobile.trim() !== base.mobile
  const dirty = Object.keys(base).some((k) => base[k] !== form[k])
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); setFormError('') }

  const submit = async (e) => {
    e.preventDefault()
    const clean = { ...form, name: form.name.trim(), email: form.email.trim(), mobile: form.mobile.trim(), address: form.address.trim(), avatar: form.avatar.trim() }
    const found = validate(clean, PROFILE_RULES)
    if (sensitive && !currentPassword) found.currentPassword = 'Enter your current password to change your email or mobile number.'
    setErrors(found)
    if (Object.keys(found).length) return
    const patch = {}
    for (const k of Object.keys(base)) if (clean[k] !== base[k] && (clean[k] !== '' || k === 'avatar' || k === 'address' || k === 'state')) patch[k] = clean[k]
    setBusy(true); setFormError('')
    try {
      await updateProfile(patch, sensitive ? { currentPassword } : undefined)
      setCurrentPassword('')
      toast.success('Your profile is up to date.', { title: 'Saved' })
    } catch (err) {
      const fe = { ...(err.fieldErrors || {}) }
      if (fe.currentPassword || (sensitive && err.status === 401)) fe.currentPassword = 'That is not your current password.'
      setErrors(fe)
      setFormError(Object.keys(fe).length ? 'Fix the highlighted fields and try again.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  const previewUser = { name: form.name, avatar: httpUrl(form.avatar) ? '' : form.avatar.trim() }

  return (
    <Card as="section" aria-labelledby="set-profile">
      <h2 id="set-profile" className="ag-card__title">Profile</h2>
      <form className="ag-form" onSubmit={submit} noValidate>
        <div className="ag-avatarrow">
          <Avatar user={previewUser} size={72} />
          <Input label="Photo link" optional type="url" inputMode="url" value={form.avatar} onChange={set('avatar')} error={errors.avatar} placeholder="https://" help="Paste a link to a photo. It shows here before you save." wrapperClassName="ag-avatarrow__field" />
        </div>
        <div className="ag-form-row">
          <Input label="Full name" required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Mobile number" required inputMode="numeric" autoComplete="tel-national" maxLength={10} value={form.mobile} onChange={set('mobile')} error={errors.mobile} help="10 digits, no spaces" />
        </div>
        <Input label="Email" required type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <div className="ag-form-row">
          <Select label="State" value={form.state} onChange={set('state')} error={errors.state} placeholder="Choose your state" options={INDIAN_STATES} />
          <Select label="Language" value={form.language} onChange={set('language')} error={errors.language} options={LANGUAGES} />
        </div>
        <Textarea label="Address" optional rows={3} autoComplete="street-address" value={form.address} onChange={set('address')} error={errors.address} style={{ minHeight: '5rem' }} />
        {sensitive && (
          <PasswordInput label="Current password" required autoComplete="current-password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setErrors((x) => ({ ...x, currentPassword: '' })) }} error={errors.currentPassword} help="Needed to change your email or mobile number, to keep your account safe." />
        )}
        {formError && <Alert tone="danger">{formError}</Alert>}
        <div className="ag-cluster">
          <Button type="submit" variant="primary" loading={busy} disabled={!dirty}>Save changes</Button>
          {dirty && !busy && <Button variant="ghost" onClick={() => { setForm(toForm(user)); setCurrentPassword(''); setErrors({}); setFormError('') }}>Discard</Button>}
        </div>
      </form>
    </Card>
  )
}

function PasswordSection() {
  const { changePassword } = useAuth()
  const toast = useToast()
  const empty = { currentPassword: '', newPassword: '', confirmPassword: '' }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); setFormError('') }

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(form, PASSWORD_RULES)
    if (!found.newPassword && form.newPassword === form.currentPassword) found.newPassword = 'Choose a password different from your current one.'
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true); setFormError('')
    try {
      await changePassword(form.currentPassword, form.newPassword)
      setForm(empty)
      toast.success('Other devices have been signed out.', { title: 'Password changed' })
    } catch (err) {
      const fe = err.fieldErrors || {}
      if (fe.currentPassword || err.status === 401 || err.status === 403) fe.currentPassword = 'That is not your current password.'
      setErrors(fe)
      setFormError(Object.keys(fe).length ? 'Fix the highlighted fields and try again.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card as="section" aria-labelledby="set-pass">
      <h2 id="set-pass" className="ag-card__title">Password</h2>
      <form className="ag-form" onSubmit={submit} noValidate>
        <PasswordInput label="Current password" required autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} error={errors.currentPassword} />
        <div className="ag-form-row">
          <PasswordInput label="New password" required autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} help="At least 8 characters with a letter and a number" />
          <PasswordInput label="Repeat new password" required autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        </div>
        {formError && <Alert tone="danger">{formError}</Alert>}
        <div><Button type="submit" variant="primary" loading={busy}>Change password</Button></div>
      </form>
    </Card>
  )
}

const THEMES = [
  { id: 'light', label: 'Light', icon: LuSun },
  { id: 'dark', label: 'Dark', icon: LuMoon },
  { id: 'system', label: 'Like my phone', icon: LuMonitor },
]

function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  return (
    <Card as="section" aria-labelledby="set-look">
      <h2 id="set-look" className="ag-card__title">Appearance</h2>
      <fieldset className="ag-themes">
        <legend className="ag-sr-only">Theme</legend>
        {THEMES.map((t) => (
          <label key={t.id}>
            <input type="radio" name="theme" value={t.id} checked={theme === t.id} onChange={() => setTheme(t.id)} />
            <span><t.icon aria-hidden="true" />{t.label}</span>
          </label>
        ))}
      </fieldset>
    </Card>
  )
}

function DangerSection() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const out = async () => {
    setBusy(true)
    await logout()
    navigate('/Login', { replace: true })
  }

  return (
    <Card as="section" aria-labelledby="set-out" className="ag-danger">
      <h2 id="set-out" className="ag-card__title">Sign out</h2>
      <p className="ag-muted">Signs you out on this device. If you think someone else has your password, change it above: that signs out every other device too.</p>
      <Button variant="danger" icon={<LuLogOut aria-hidden="true" />} onClick={() => setOpen(true)}>Sign out</Button>
      <ConfirmDialog open={open} title="Sign out of AgroSense?" message="Your tasks and settings stay on this device." confirmLabel="Sign out" danger loading={busy} onConfirm={out} onCancel={() => setOpen(false)} />
    </Card>
  )
}

export default function Setting() {
  return (
    <>
      <div className="ag-pagehead">
        <div>
          <h1>Your <span className="ag-em">settings</span></h1>
          <p>Keep your details right so buyers and sellers can reach you.</p>
        </div>
      </div>
      <div className="ag-settings">
        <ProfileSection />
        <PasswordSection />
        <AppearanceSection />
        <DangerSection />
      </div>
    </>
  )
}
