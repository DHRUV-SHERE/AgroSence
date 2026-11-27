/** Farming resources (machinery and inputs): GET /resources. Cards link to /features/resources/:id. */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LuBookOpen, LuSearchX } from 'react-icons/lu'
import { useFetch } from '../hooks/useFetch'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { imageUrl, srcSet } from '../lib/imageUrl'
import { truncate } from '../lib/format'
import { Button, Card, EmptyState, ErrorState, Input, Skeleton, SkeletonGrid } from '../components/ui'
import '../styles/pages-content.css'

function ResourceCardSkeleton() {
  return (
    <div className="ag-card ag-card--flush" aria-hidden="true">
      <Skeleton height={190} style={{ borderRadius: 0 }} />
      <div className="ag-rescard__body"><Skeleton width="65%" height={22} /><Skeleton /><Skeleton width="80%" /></div>
    </div>
  )
}

export default function Resource1() {
  const { data, loading, error, refetch } = useFetch('/resources', { params: { limit: 100, sort: 'name' } })
  const [query, setQuery] = useState('')
  const q = useDebouncedValue(query).trim().toLowerCase()
  const list = useMemo(() => (Array.isArray(data) ? data : []), [data])
  const shown = useMemo(
    () => list.filter((r) => !q || [r.name, r.description, r.purpose, r.popularbrand].some((t) => String(t || '').toLowerCase().includes(q))),
    [list, q],
  )

  return (
    <>
      <header className="ag-pagehead">
        <div>
          <h1>Farming resources, <span className="ag-em">explained</span></h1>
          <p>Machinery and inputs, with what each is for, the brands farmers trust and how to use it.</p>
        </div>
      </header>

      <div className="ag-toolbar">
        <Input wrapperClassName="ag-toolbar__search" label="Search resources" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tractor, sprayer, seeds" autoComplete="off" />
        {!loading && !error && <p className="ag-muted ag-toolbar__count" role="status" aria-live="polite">{shown.length} of {list.length}</p>}
      </div>

      {loading ? (
        <SkeletonGrid count={6} min="17rem"><ResourceCardSkeleton /></SkeletonGrid>
      ) : error ? (
        <ErrorState error={error} title="Could not load resources" onRetry={refetch} />
      ) : list.length === 0 ? (
        <EmptyState icon={LuBookOpen} title="No resources yet" message="New guides are added regularly. Please check back soon." />
      ) : shown.length === 0 ? (
        <EmptyState icon={LuSearchX} title="Nothing matches that" message="Try another word, or clear the search." action={<Button onClick={() => setQuery('')}>Clear search</Button>} />
      ) : (
        <ul className="ag-grid ag-reslist" style={{ '--min': '17rem' }}>
          {shown.map((r) => (
            <li key={r.id}>
              <Card as="article" flush interactive className="ag-rescard">
                <img src={imageUrl(r.image, { width: 480 })} srcSet={srcSet(r.image, [320, 480, 800])} sizes="(min-width: 62rem) 22rem, 90vw" alt="" width="480" height="300" loading="lazy" decoding="async" />
                <div className="ag-rescard__body">
                  <h2><Link to={`/features/resources/${r.id}`} className="ag-rescard__link">{r.name}</Link></h2>
                  <p>{truncate(r.description || r.purpose || '', 110)}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
