/** Expert guidance: searchable directory of agricultural experts plus an ask-an-expert form that posts to POST /support. */
import { useMemo, useRef, useState } from 'react'
import { LuMail, LuMapPin, LuMessageSquareText, LuPhone, LuSearchX, LuStar } from 'react-icons/lu'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { EXPERTS } from '../components/content/experts'
import SupportForm from '../components/content/SupportForm'
import { Badge, Button, Card, EmptyState, Input, Select } from '../components/ui'
import '../styles/pages-content.css'

const SPECIALTIES = [...new Set(EXPERTS.flatMap((e) => e.specialties))].sort()

export default function AgroExpert() {
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [target, setTarget] = useState('')
  const formRef = useRef(null)
  const q = useDebouncedValue(query).trim().toLowerCase()

  const shown = useMemo(() => EXPERTS.filter((e) => {
    if (specialty && !e.specialties.includes(specialty)) return false
    return !q || [e.name, e.title, e.address, ...e.specialties].some((t) => t.toLowerCase().includes(q))
  }), [q, specialty])

  const chosen = EXPERTS.find((e) => String(e.id) === target)
  const ask = (id) => {
    setTarget(String(id))
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    formRef.current?.querySelector('textarea')?.focus({ preventScroll: true })
  }

  return (
    <>
      <header className="ag-pagehead">
        <div>
          <h1>Advice from <span className="ag-em">people who know</span></h1>
          <p>Find an agricultural expert by name, subject or place, then send your question. Describe your crop, soil and problem so the answer fits your field.</p>
        </div>
      </header>

      <div className="ag-experts">
        <section aria-labelledby="experts-h">
          <h2 id="experts-h" className="ag-sr-only">Experts</h2>
          <div className="ag-toolbar">
            <Input wrapperClassName="ag-toolbar__search" label="Search experts" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, subject or place" autoComplete="off" />
            <Select wrapperClassName="ag-toolbar__select" label="Subject" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="All subjects" options={SPECIALTIES} />
          </div>
          <p className="ag-muted ag-toolbar__count" role="status" aria-live="polite">{shown.length} {shown.length === 1 ? 'expert' : 'experts'}</p>

          {shown.length === 0 ? (
            <EmptyState icon={LuSearchX} title="No expert matches" message="Try another subject or a shorter search." action={<Button onClick={() => { setQuery(''); setSpecialty('') }}>Clear filters</Button>} />
          ) : (
            <ul className="ag-expertlist">
              {shown.map((e) => (
                <li key={e.id} className="ag-expert">
                  <div className="ag-expert__head">
                    <div>
                      <h3>{e.name}</h3>
                      <p>{e.title}</p>
                    </div>
                    <span className="ag-expert__rating ag-num" aria-label={`Rated ${e.rating} from ${e.reviews} reviews`}>
                      <LuStar aria-hidden="true" /> {e.rating} <small>({e.reviews})</small>
                    </span>
                  </div>
                  <div className="ag-expert__tags">{e.specialties.map((s) => <Badge key={s}>{s}</Badge>)}</div>
                  <ul className="ag-expert__contact">
                    <li><LuMail aria-hidden="true" /><a href={`mailto:${e.email}`}>{e.email}</a></li>
                    <li><LuPhone aria-hidden="true" /><a href={`tel:${e.phone.replace(/[^\d+]/g, '')}`}>{e.phone}</a></li>
                    <li><LuMapPin aria-hidden="true" /><span>{e.address}</span></li>
                  </ul>
                  <div><Button size="sm" icon={<LuMessageSquareText aria-hidden="true" />} onClick={() => ask(e.id)}>Ask this expert<span className="ag-sr-only">: {e.name}</span></Button></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="ag-askbox" ref={formRef} aria-labelledby="ask-h">
          <Card>
            <h2 id="ask-h">Ask an expert</h2>
            <p className="ag-muted">Your question reaches our support team, who pass it to the right expert and reply by email.</p>
            <SupportForm
              messageLabel="Your question"
              placeholder="Which crop, which season, what are you seeing?"
              submitLabel="Send question"
              prefix={chosen ? `[Question for ${chosen.name}, ${chosen.email}]\n\n` : '[Expert advice request]\n\n'}
            >
              <Select label="Question for" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Any expert" options={EXPERTS.map((x) => ({ value: String(x.id), label: x.name }))} />
            </SupportForm>
          </Card>
        </aside>
      </div>
    </>
  )
}
