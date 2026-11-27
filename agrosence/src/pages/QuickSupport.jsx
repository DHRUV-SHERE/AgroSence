/** Support: contact form (POST /support) and searchable FAQ (GET /agriculture/faq -> [{ question, answer }]). */
import { useMemo, useState } from 'react'
import { LuCircleHelp, LuMail, LuMapPin, LuSearchX } from 'react-icons/lu'
import { useFetch } from '../hooks/useFetch'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { CONTACT } from '../lib/navigation'
import SupportForm from '../components/content/SupportForm'
import { Button, Card, EmptyState, ErrorState, Input, Skeleton } from '../components/ui'
import '../styles/pages-content.css'

function FaqSkeleton() {
  return (
    <div className="ag-faq" role="status" aria-label="Loading questions">
      {[0, 1, 2, 3, 4].map((i) => <div className="ag-faq__item" key={i} aria-hidden="true"><Skeleton width={`${60 + (i % 3) * 12}%`} height={22} /></div>)}
    </div>
  )
}

export default function QuickSupport() {
  const { data, loading, error, refetch } = useFetch('/agriculture/faq')
  const [query, setQuery] = useState('')
  const q = useDebouncedValue(query).trim().toLowerCase()

  const faqs = useMemo(() => {
    const list = Array.isArray(data) ? data : Array.isArray(data?.faqs) ? data.faqs : []
    return list.filter((f) => f && f.question && f.answer)
  }, [data])
  const shown = useMemo(() => faqs.filter((f) => !q || `${f.question} ${f.answer}`.toLowerCase().includes(q)), [faqs, q])

  return (
    <>
      <header className="ag-pagehead">
        <div>
          <h1>Help, <span className="ag-em">when you need it</span></h1>
          <p>Look for your question first. If you do not find an answer, write to us and a person will reply.</p>
        </div>
      </header>

      <div className="ag-support">
        <section aria-labelledby="faq-h">
          <h2 id="faq-h" className="ag-h2">Common questions</h2>
          <div className="ag-toolbar">
            <Input wrapperClassName="ag-toolbar__search" label="Search questions" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Soil, irrigation, pests" autoComplete="off" />
          </div>
          {loading ? <FaqSkeleton /> : error ? (
            <ErrorState error={error} title="Could not load questions" onRetry={refetch} />
          ) : faqs.length === 0 ? (
            <EmptyState icon={LuCircleHelp} title="No questions listed yet" message="Use the form to ask us directly." />
          ) : shown.length === 0 ? (
            <EmptyState icon={LuSearchX} title="No question matches" message="Try other words, or send us your question." action={<Button onClick={() => setQuery('')}>Clear search</Button>} />
          ) : (
            <div className="ag-faq">
              <p className="ag-sr-only" role="status" aria-live="polite">{shown.length} questions shown</p>
              {shown.map((f, i) => (
                <details className="ag-faq__item" key={`${i}-${f.question}`}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          )}
        </section>

        <aside className="ag-askbox" aria-labelledby="support-h">
          <Card>
            <h2 id="support-h">Write to us</h2>
            <SupportForm messageLabel="Describe your problem" placeholder="What happened, and what did you expect?" prefix={'[Support request]\n\n'} />
          </Card>
          <dl className="ag-contactlist">
            <div><dt><LuMail aria-hidden="true" /> Email</dt><dd><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></dd></div>
            <div><dt><LuMapPin aria-hidden="true" /> Address</dt><dd>{CONTACT.address}</dd></div>
            <div><dt>Hours</dt>{CONTACT.hours.map((h) => <dd key={h}>{h}</dd>)}</div>
          </dl>
        </aside>
      </div>
    </>
  )
}
