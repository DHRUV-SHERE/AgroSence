/** Contact: form posts to POST /contact (contract). Layout: PublicLayout. */
import { useState } from 'react'
import { LuCircleCheck } from 'react-icons/lu'
import { http } from '../lib/api'
import { CONTACT } from '../lib/navigation'
import { rules, validate } from '../lib/validate'
import { Alert, Button, Input, Textarea } from '../components/ui'
import { useToast } from '../components/ui'

const EMPTY = { name: '', email: '', mobile: '', address: '', message: '' }
const SCHEMA = {
  name: [rules.required('Your name')],
  email: [rules.required('Your email'), rules.email],
  mobile: [rules.mobile],
  message: [rules.required('A message'), rules.minLength(10, 'Your message')],
}

export default function Contact() {
  const toast = useToast()
  const [values, setValues] = useState(EMPTY)
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
      const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim()))
      await http.post('/contact', body)
      setSent(true)
      setValues(EMPTY)
      toast.success('We have received your message.')
    } catch (err) {
      setErrors(err.fieldErrors || {})
      setServerError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="ag-pagehero">
        <div className="ag-container">
          <h1>Talk to the team</h1>
          <p>A question about your account, a crop listing or the project itself? Write to us and we will get back to you as soon as we can.</p>
        </div>
      </section>

      <section className="ag-section">
        <div className="ag-container ag-contact">
          <div>
            <h2 className="ag-sr-only">Send us a message</h2>
            {sent ? (
              <div className="ag-success" role="status">
                <LuCircleCheck aria-hidden="true" />
                <h2>Message sent</h2>
                <p>Thank you for reaching out. We will reply to the email you gave us.</p>
                <Button onClick={() => setSent(false)}>Send another message</Button>
              </div>
            ) : (
              <form className="ag-form" onSubmit={submit} noValidate>
                <div className="ag-form-row">
                  <Input label="Name" name="name" value={values.name} onChange={set} error={errors.name} autoComplete="name" required />
                  <Input label="Email" name="email" type="email" value={values.email} onChange={set} error={errors.email} autoComplete="email" required />
                </div>
                <div className="ag-form-row">
                  <Input label="Mobile number" name="mobile" type="tel" inputMode="numeric" maxLength={10} value={values.mobile} onChange={set} error={errors.mobile} autoComplete="tel-national" optional />
                  <Input label="Address" name="address" value={values.address} onChange={set} error={errors.address} autoComplete="street-address" optional />
                </div>
                <Textarea label="Message" name="message" rows={6} value={values.message} onChange={set} error={errors.message} required />
                {serverError && <Alert tone="danger">{serverError}</Alert>}
                <div><Button type="submit" variant="primary" size="lg" loading={busy}>{busy ? 'Sending' : 'Send message'}</Button></div>
              </form>
            )}
          </div>

          <aside className="ag-contact__info" aria-label="Contact details">
            <h2 className="ag-sr-only">Email, phone and office</h2>
            <dl>
              <div><dt>Office</dt><dd>{CONTACT.address}</dd></div>
              <div><dt>Phone</dt>{CONTACT.phones.map((p) => <dd key={p.value}><a href={`tel:${p.value.replace(/\s/g, '')}`}>{p.value}</a> <span className="ag-muted">({p.label})</span></dd>)}</div>
              <div><dt>Email</dt><dd><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></dd></div>
              <div><dt>Office hours</dt>{CONTACT.hours.map((h) => <dd key={h}>{h}</dd>)}</div>
            </dl>
            <iframe
              title="Map of U.V. Patel College of Engineering, Ganpat University"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.115154878245!2d72.45628241101491!3d23.528360297175755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c476dcc7fad61%3A0x1cf6e21d7ca9091d!2sU.%20V.%20Patel%20College%20of%20Engineering%20(Main%20Building)!5e0!3m2!1sen!2sin!4v1744093555361!5m2!1sen!2sin"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </aside>
        </div>
      </section>
    </>
  )
}
