/** Support / ask-an-expert form. Posts to POST /support { name, email, message } (contract). Shared by QuickSupport and AgroExpert. */
import { useState } from 'react'
import { LuCircleCheck, LuSend } from 'react-icons/lu'
import { http } from '../../lib/api'
import { rules, validate } from '../../lib/validate'
import { useAuth } from '../../hooks/useAuth'
import { Alert, Button, Input, Textarea, useToast } from '../ui'

const SCHEMA = {
  name: [rules.required('Your name')],
  email: [rules.required('Your email'), rules.email],
  message: [rules.required('A message'), rules.minLength(10, 'Your message')],
}

export default function SupportForm({ messageLabel = 'How can we help?', placeholder, prefix = '', submitLabel = 'Send message', children }) {
  const { user } = useAuth()
  const toast = useToast()
  const [values, setValues] = useState({ name: user?.name || '', email: user?.email || '', message: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(values, SCHEMA)
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      await http.post('/support', {
        name: values.name.trim(),
        email: values.email.trim(),
        message: `${prefix}${values.message.trim()}`,
      })
      setSent(true)
      setValues((v) => ({ ...v, message: '' }))
      toast.success('Your message has been sent.')
    } catch (err) {
      setErrors(err.fieldErrors || {})
      setServerError(err.status === 503 ? 'Support email is not available right now. Please try again later or call us.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="ag-success" role="status">
        <LuCircleCheck aria-hidden="true" />
        <h2>Message sent</h2>
        <p>Thank you. We will reply to {values.email}.</p>
        <Button onClick={() => setSent(false)}>Write another message</Button>
      </div>
    )
  }

  return (
    <form className="ag-form" onSubmit={submit} noValidate>
      {children}
      <Input label="Your name" name="name" value={values.name} onChange={set} error={errors.name} autoComplete="name" required />
      <Input label="Email" name="email" type="email" value={values.email} onChange={set} error={errors.email} autoComplete="email" required />
      <Textarea label={messageLabel} name="message" rows={5} placeholder={placeholder} value={values.message} onChange={set} error={errors.message} maxLength={2000} required />
      {serverError && <Alert tone="danger">{serverError}</Alert>}
      <div><Button type="submit" variant="primary" loading={busy} icon={<LuSend aria-hidden="true" />}>{busy ? 'Sending' : submitLabel}</Button></div>
    </form>
  )
}
