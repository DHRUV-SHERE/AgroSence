/**
 * Form fields with label, help text and error wiring (aria-invalid, aria-describedby).
 *   <Input label="Email" name="email" type="email" value={v} onChange={..} error={errors.email} required help="We never share it" />
 *   <PasswordInput label="Password" .../>   // show/hide toggle
 *   <Select label="State" options={['Gujarat', ...]} placeholder="Choose a state" />   // or options=[{value,label}]
 *   <Textarea label="Message" rows={5} />
 *   <Checkbox label="Remember me" checked onChange />
 * `error` is a string (or falsy). `optional` adds an "(optional)" hint. All forward refs and extra props to the control.
 */
import { forwardRef, useId, useState } from 'react'
import { LuCircleAlert, LuEye, LuEyeOff } from 'react-icons/lu'
import { cx } from '../../lib/cx'

function Field({ label, error, help, required, optional, id, className, children }) {
  return (
    <div className={cx('ag-field', className)} data-invalid={error ? 'true' : undefined}>
      {label && (
        <label className="ag-label" htmlFor={id}>
          {label}
          {required && <span className="ag-req" aria-hidden="true">*</span>}
          {optional && <span className="ag-optional">(optional)</span>}
        </label>
      )}
      {children}
      {help && !error && <span className="ag-help" id={`${id}-help`}>{help}</span>}
      {error && (
        <span className="ag-error" id={`${id}-err`} role="alert">
          <LuCircleAlert aria-hidden="true" width="16" height="16" style={{ flex: 'none', marginTop: 3 }} />
          {error}
        </span>
      )}
    </div>
  )
}

function controlProps(id, { error, help, required }) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-err` : help ? `${id}-help` : undefined,
    'aria-required': required || undefined,
  }
}

export const Input = forwardRef(function Input({ label, error, help, required, optional, className, wrapperClassName, id: idProp, ...rest }, ref) {
  const auto = useId()
  const id = idProp || auto
  return (
    <Field {...{ label, error, help, required, optional, id }} className={wrapperClassName}>
      <input ref={ref} id={id} className={cx('ag-input', className)} {...controlProps(id, { error, help, required })} {...rest} />
    </Field>
  )
})

export const PasswordInput = forwardRef(function PasswordInput({ label, error, help, required, optional, wrapperClassName, id: idProp, ...rest }, ref) {
  const auto = useId()
  const id = idProp || auto
  const [show, setShow] = useState(false)
  return (
    <Field {...{ label, error, help, required, optional, id }} className={wrapperClassName}>
      <div className="ag-inputwrap">
        <input ref={ref} id={id} className="ag-input" type={show ? 'text' : 'password'} {...controlProps(id, { error, help, required })} {...rest} />
        <button type="button" className="ag-iconbtn ag-iconbtn--sm ag-inputwrap__end" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          {show ? <LuEyeOff /> : <LuEye />}
        </button>
      </div>
    </Field>
  )
})

export const Select = forwardRef(function Select({ label, error, help, required, optional, options = [], placeholder, wrapperClassName, children, id: idProp, ...rest }, ref) {
  const auto = useId()
  const id = idProp || auto
  return (
    <Field {...{ label, error, help, required, optional, id }} className={wrapperClassName}>
      <select ref={ref} id={id} className="ag-select" {...controlProps(id, { error, help, required })} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          return <option key={opt.value} value={opt.value}>{opt.label}</option>
        })}
        {children}
      </select>
    </Field>
  )
})

export const Textarea = forwardRef(function Textarea({ label, error, help, required, optional, wrapperClassName, id: idProp, ...rest }, ref) {
  const auto = useId()
  const id = idProp || auto
  return (
    <Field {...{ label, error, help, required, optional, id }} className={wrapperClassName}>
      <textarea ref={ref} id={id} className="ag-textarea" {...controlProps(id, { error, help, required })} {...rest} />
    </Field>
  )
})

export function Checkbox({ label, className, ...rest }) {
  return (
    <label className={cx('ag-check', className)}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  )
}
