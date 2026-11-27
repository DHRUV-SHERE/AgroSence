/**
 * Accessible tabs (roving tabindex, arrow/Home/End keys).
 *   <Tabs tabs={[{ id: 'buying', label: 'Buying', content: <Orders role="buyer" /> }, ...]} defaultId="buying" onChange={(id)=>{}} />
 * Controlled: pass `value` + `onChange`.
 */
import { useId, useRef, useState } from 'react'

export function Tabs({ tabs, defaultId, value, onChange, label = 'Sections' }) {
  const base = useId()
  const [inner, setInner] = useState(defaultId ?? tabs[0]?.id)
  const active = value ?? inner
  const refs = useRef({})
  const select = (id) => { setInner(id); onChange?.(id); refs.current[id]?.focus() }

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === active)
    const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }
    if (!(e.key in keys)) return
    e.preventDefault()
    select(tabs[(keys[e.key] + tabs.length) % tabs.length].id)
  }

  const current = tabs.find((t) => t.id === active)
  return (
    <div className="ag-tabs">
      <div className="ag-tabs__list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el }}
            role="tab"
            type="button"
            id={`${base}-tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={t.id === active ? 0 : -1}
            className="ag-tab"
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current && (
        <div role="tabpanel" id={`${base}-panel-${current.id}`} aria-labelledby={`${base}-tab-${current.id}`} className="ag-tabs__panel" tabIndex={0}>
          {current.content}
        </div>
      )}
    </div>
  )
}
