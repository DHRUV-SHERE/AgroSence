/** Schemes for one state: GET /schemes?state=<name> (also returns "All States" schemes). Client-side search and scope filter. */
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuExternalLink, LuLandmark, LuSearchX } from 'react-icons/lu'
import { useFetch } from '../hooks/useFetch'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { stateFromParam } from '../components/content/states'
import { Badge, Button, EmptyState, ErrorState, Input, Skeleton, SkeletonText } from '../components/ui'
import '../styles/pages-content.css'

const safeLink = (url) => (/^https?:\/\//i.test(url || '') ? url : null)

function SchemeSkeleton() {
  return (
    <div className="ag-schemelist" role="status" aria-label="Loading schemes">
      {[0, 1, 2].map((i) => (
        <div className="ag-scheme" key={i} aria-hidden="true">
          <Skeleton width="45%" height={26} />
          <SkeletonText lines={2} />
          <Skeleton width="30%" height={40} />
        </div>
      ))}
    </div>
  )
}

export default function StateWiseScheme() {
  const { stateName } = useParams()
  const known = stateFromParam(stateName)
  const name = known?.name || decodeURIComponent(stateName || '').replace(/-/g, ' ')
  const isAll = name.toLowerCase() === 'all states'
  useDocumentTitle(`${name} schemes`)

  const { data, loading, error, refetch } = useFetch('/schemes', { params: { state: name, limit: 100 } })
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('all')
  const q = useDebouncedValue(query).trim().toLowerCase()

  const list = useMemo(() => (Array.isArray(data) ? data : []), [data])
  const shown = useMemo(() => list.filter((s) => {
    const national = String(s.state).toLowerCase() === 'all states'
    if (scope === 'state' && national) return false
    if (scope === 'national' && !national) return false
    return !q || [s.name, s.description, s.eligibility, s.benefits].some((t) => String(t || '').toLowerCase().includes(q))
  }), [list, q, scope])

  const tabs = [
    { id: 'all', label: 'All' },
    ...(!isAll ? [{ id: 'state', label: `${name} only` }] : []),
    ...(!isAll ? [{ id: 'national', label: 'Every state' }] : []),
  ]

  return (
    <>
      <p className="ag-back"><Link to="/features/government-schemes"><LuArrowLeft aria-hidden="true" /> All states</Link></p>
      <header className="ag-pagehead">
        <div>
          <h1>{isAll ? 'Schemes open to every state' : <>Schemes in <span className="ag-em">{name}</span></>}</h1>
          <p>Check who can apply first, then apply on the official site.</p>
        </div>
      </header>

      <div className="ag-toolbar">
        <Input wrapperClassName="ag-toolbar__search" label="Search these schemes" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Subsidy, insurance, loan" autoComplete="off" />
        {tabs.length > 1 && (
          <div className="ag-filter" role="group" aria-label="Show">
            {tabs.map((t) => (
              <button key={t.id} type="button" className="ag-cfilter" aria-pressed={scope === t.id} onClick={() => setScope(t.id)}>{t.label}</button>
            ))}
          </div>
        )}
      </div>

      {loading ? <SchemeSkeleton /> : error ? (
        <ErrorState error={error} title="Could not load schemes" onRetry={refetch} />
      ) : list.length === 0 ? (
        <EmptyState icon={LuLandmark} title={`No schemes listed for ${name} yet`} message="Schemes that apply to every state are listed separately." action={<Button as={Link} to="/state-schemes/all-states">See schemes for all states</Button>} />
      ) : shown.length === 0 ? (
        <EmptyState icon={LuSearchX} title="No scheme matches" message="Try a different word or show all schemes." action={<Button onClick={() => { setQuery(''); setScope('all') }}>Clear filters</Button>} />
      ) : (
        <ul className="ag-schemelist">
          {shown.map((s) => {
            const link = safeLink(s.applyLink)
            return (
              <li key={s.id} className="ag-scheme">
                <div className="ag-scheme__head">
                  <h2>{s.name}</h2>
                  {String(s.state).toLowerCase() === 'all states' ? <Badge tone="info">Every state</Badge> : <Badge tone="brand">{s.state}</Badge>}
                </div>
                {s.description && <p>{s.description}</p>}
                <dl className="ag-facts">
                  {s.eligibility && <div><dt>Who can apply</dt><dd>{s.eligibility}</dd></div>}
                  {s.benefits && <div><dt>What you get</dt><dd>{s.benefits}</dd></div>}
                </dl>
                {link && (
                  <div>
                    <Button as="a" href={link} target="_blank" rel="noopener noreferrer" variant="primary" icon={<LuExternalLink aria-hidden="true" />}>
                      Apply on official site<span className="ag-sr-only"> (opens in a new tab)</span>
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
