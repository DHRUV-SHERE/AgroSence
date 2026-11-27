/** One resource: GET /resources/:id -> { id, name, description, purpose, advantages, popularbrand, howtouse, image, link }. */
import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuBookOpen, LuExternalLink } from 'react-icons/lu'
import { useFetch } from '../hooks/useFetch'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { imageUrl, srcSet } from '../lib/imageUrl'
import { Button, EmptyState, ErrorState, Skeleton, SkeletonText } from '../components/ui'
import '../styles/pages-content.css'

const FACTS = [
  ['purpose', 'What it is for'],
  ['popularbrand', 'Popular brands'],
  ['advantages', 'Advantages'],
  ['howtouse', 'How to use it'],
]

function DetailSkeleton() {
  return (
    <div className="ag-resdetail" role="status" aria-label="Loading resource">
      <Skeleton className="ag-resdetail__img" style={{ aspectRatio: '4 / 3', height: 'auto' }} />
      <div className="ag-resdetail__text"><Skeleton width="60%" height={36} /><SkeletonText lines={3} /><SkeletonText lines={4} /></div>
    </div>
  )
}

export default function ResourceDetail() {
  const { id } = useParams()
  const { data: r, loading, error, refetch } = useFetch(`/resources/${id}`, { enabled: Boolean(id) })
  useDocumentTitle(r?.name)

  let body
  if (loading) body = <DetailSkeleton />
  else if (error) {
    body = error.status === 404
      ? <EmptyState icon={LuBookOpen} title="We could not find that resource" message="It may have been removed." action={<Button as={Link} to="/features/resources">See all resources</Button>} />
      : <ErrorState error={error} title="Could not load this resource" onRetry={refetch} />
  } else if (r) {
    const link = /^https?:\/\//i.test(r.link || '') ? r.link : null
    const facts = FACTS.filter(([k]) => r[k])
    body = (
      <article className="ag-resdetail">
        <img className="ag-resdetail__img" src={imageUrl(r.image, { width: 800 })} srcSet={srcSet(r.image, [400, 800, 1200])} sizes="(min-width: 52rem) 40vw, 100vw" alt={r.name} width="800" height="600" decoding="async" />
        <div className="ag-resdetail__text">
          <h1>{r.name}</h1>
          {r.description && <p className="ag-lede">{r.description}</p>}
          {facts.length > 0 && (
            <dl className="ag-facts">
              {facts.map(([k, label]) => <div key={k}><dt>{label}</dt><dd>{r[k]}</dd></div>)}
            </dl>
          )}
          {link && (
            <div>
              <Button as="a" href={link} target="_blank" rel="noopener noreferrer" variant="primary" icon={<LuExternalLink aria-hidden="true" />}>
                Watch a video guide<span className="ag-sr-only"> (opens in a new tab)</span>
              </Button>
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <>
      <p className="ag-back"><Link to="/features/resources"><LuArrowLeft aria-hidden="true" /> All resources</Link></p>
      {body}
    </>
  )
}
