/** Kharif / Rabi / Zaid calendar with crop suggestions and the user's own seasonal tasks. */
import { useState } from 'react'
import { LuCalendarPlus, LuPlus, LuTrash2 } from 'react-icons/lu'
import { Badge, Button, IconButton, Input, Select } from '../ui'
import { formatDate } from '../../lib/format'
import { SEASONS, currentSeasons } from './seasons'
import { todayStr } from './useRoutine'

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function Strip() {
  const now = new Date().getMonth()
  return (
    <ol className="ag-year" aria-label="Seasons across the year">
      {MONTHS.map((m, i) => {
        const here = SEASONS.filter((s) => s.months.includes(i))
        return (
          <li key={MONTH_NAMES[i]} className={i === now ? 'is-now' : undefined}>
            <span className="ag-sr-only">{MONTH_NAMES[i]}: {here.map((s) => s.name).join(' and ')}{i === now ? ', this month' : ''}</span>
            <span aria-hidden="true">{m}</span>
            <span className="ag-year__bars" aria-hidden="true">
              {SEASONS.map((s) => <i key={s.id} className={`ag-year__${s.id}`} data-on={s.months.includes(i)} />)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function SeasonPlanner({ routine }) {
  const { tasks, add, remove, toggle } = routine
  const active = currentSeasons()
  const [title, setTitle] = useState('')
  const [season, setSeason] = useState(active[0] || 'kharif')
  const [due, setDue] = useState('')
  const [errors, setErrors] = useState({})

  const mine = tasks.filter((t) => t.kind === 'season')
  const has = (seasonId, text) => mine.some((t) => t.season === seasonId && t.title === text)

  const submit = (e) => {
    e.preventDefault()
    const t = title.trim()
    const next = {}
    if (!t) next.title = 'Write the task, for example "Book a tractor for sowing".'
    else if (t.length > 80) next.title = 'Keep it under 80 characters.'
    if (due && due < todayStr()) next.due = 'Choose today or a later date.'
    setErrors(next)
    if (Object.keys(next).length) return
    add({ kind: 'season', title: t, season, ...(due ? { due } : {}) })
    setTitle(''); setDue('')
  }

  return (
    <div className="ag-plan">
      <Strip />

      <div className="ag-seasons">
        {SEASONS.map((s) => {
          const list = mine.filter((t) => t.season === s.id)
          const now = active.includes(s.id)
          return (
            <section key={s.id} className="ag-season" aria-labelledby={`s-${s.id}`} data-now={now || undefined}>
              <header>
                <h3 id={`s-${s.id}`}>{s.name}</h3>
                {now && <Badge tone="success">Running now</Badge>}
              </header>
              <p className="ag-muted ag-season__span">{s.span}. {s.note}</p>
              <p className="ag-season__crops"><span className="ag-muted">Crops:</span> {s.crops.join(', ')}</p>

              <h4>Guide</h4>
              <ul className="ag-tips">
                {s.tasks.map((g) => (
                  <li key={g.title}>
                    <span><strong>{g.when}</strong> {g.title}</span>
                    <IconButton
                      label={has(s.id, g.title) ? `${g.title} is in your plan` : `Add to my plan: ${g.title}`}
                      size="sm"
                      disabled={has(s.id, g.title)}
                      onClick={() => add({ kind: 'season', season: s.id, title: g.title })}
                    >
                      <LuCalendarPlus />
                    </IconButton>
                  </li>
                ))}
              </ul>

              {list.length > 0 && (
                <>
                  <h4>My plan</h4>
                  <ul className="ag-tasks">
                    {list.map((t) => (
                      <li key={t.id} className={t.done ? 'is-done' : undefined}>
                        <label>
                          <input type="checkbox" checked={Boolean(t.done)} onChange={() => toggle(t.id)} />
                          <span>{t.title}{t.due && <small className="ag-muted"> · by {formatDate(t.due)}</small>}</span>
                        </label>
                        <IconButton label={`Delete task: ${t.title}`} size="sm" onClick={() => remove(t.id)}><LuTrash2 /></IconButton>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )
        })}
      </div>

      <form className="ag-plan__add ag-plan__add--season" onSubmit={submit} noValidate>
        <Input label="Your own seasonal task" value={title} onChange={(e) => { setTitle(e.target.value); setErrors((x) => ({ ...x, title: '' })) }} error={errors.title} maxLength={90} placeholder="Book a tractor for sowing" wrapperClassName="ag-plan__title" />
        <Select label="Season" value={season} onChange={(e) => setSeason(e.target.value)} options={SEASONS.map((s) => ({ value: s.id, label: s.name }))} />
        <Input label="Do by" optional type="date" value={due} min={todayStr()} onChange={(e) => { setDue(e.target.value); setErrors((x) => ({ ...x, due: '' })) }} error={errors.due} />
        <Button type="submit" variant="primary" icon={<LuPlus aria-hidden="true" />}>Add to plan</Button>
      </form>
    </div>
  )
}
