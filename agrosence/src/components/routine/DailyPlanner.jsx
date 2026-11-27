/** Daily tasks: repeat every day, tick resets at midnight. */
import { useState } from 'react'
import { LuListChecks, LuPlus, LuTrash2 } from 'react-icons/lu'
import { Button, EmptyState, IconButton, Input, Select } from '../ui'
import { SUGGESTED_DAILY, TIMES } from './seasons'
import { todayStr } from './useRoutine'

export default function DailyPlanner({ routine }) {
  const { tasks, add, addMany, remove, toggle } = routine
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('morning')
  const [error, setError] = useState('')

  const daily = tasks.filter((t) => t.kind === 'daily')
  const today = todayStr()
  const done = daily.filter((t) => t.doneOn === today).length

  const submit = (e) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) { setError('Write the task, for example "Irrigate the wheat plot".'); return }
    if (t.length > 80) { setError('Keep it under 80 characters.'); return }
    add({ kind: 'daily', title: t, when })
    setTitle(''); setError('')
  }

  return (
    <div className="ag-plan">
      <form className="ag-plan__add" onSubmit={submit} noValidate>
        <Input
          label="New daily task"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (error) setError('') }}
          error={error}
          maxLength={90}
          placeholder="Irrigate the wheat plot"
          wrapperClassName="ag-plan__title"
        />
        <Select label="When" value={when} onChange={(e) => setWhen(e.target.value)} options={TIMES.map((t) => ({ value: t.id, label: t.label }))} />
        <Button type="submit" variant="primary" icon={<LuPlus aria-hidden="true" />}>Add task</Button>
      </form>

      {!daily.length ? (
        <EmptyState
          icon={LuListChecks}
          title="Plan your day"
          message="Add the jobs you do every day. They reset each morning so you can tick them off again."
          action={<Button onClick={() => addMany(SUGGESTED_DAILY.map((s) => ({ kind: 'daily', ...s })))}>Add 5 suggested tasks</Button>}
        />
      ) : (
        <>
          <div className="ag-progress">
            <div className="ag-rowbetween">
              <strong>Today</strong>
              <span className="ag-num ag-muted">{done} of {daily.length} done</span>
            </div>
            <div className="ag-progress__bar" role="progressbar" aria-label="Tasks done today" aria-valuemin={0} aria-valuemax={daily.length} aria-valuenow={done}>
              <span style={{ width: `${(done / daily.length) * 100}%` }} />
            </div>
          </div>

          {TIMES.map((slot) => {
            const list = daily.filter((t) => t.when === slot.id)
            if (!list.length) return null
            return (
              <section key={slot.id} aria-labelledby={`slot-${slot.id}`}>
                <h3 id={`slot-${slot.id}`} className="ag-plan__slot">{slot.label}</h3>
                <ul className="ag-tasks">
                  {list.map((t) => {
                    const isDone = t.doneOn === today
                    return (
                      <li key={t.id} className={isDone ? 'is-done' : undefined}>
                        <label>
                          <input type="checkbox" checked={isDone} onChange={() => toggle(t.id)} />
                          <span>{t.title}</span>
                        </label>
                        <IconButton label={`Delete task: ${t.title}`} size="sm" onClick={() => remove(t.id)}><LuTrash2 /></IconButton>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
