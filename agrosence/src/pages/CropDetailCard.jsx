/** Crop detail (AppLayout). GET /crops/:id. Gallery, facts ledger, seller, and the order request panel. */
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuLeaf } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { Badge, Card, ErrorState, Skeleton, SkeletonText, statusTone } from '../components/ui'
import OrderPanel from '../components/marketaccess/OrderPanel'
import { categoryLabel, cropView } from '../components/marketaccess/cropMeta'
import { formatDate, formatINR, formatNumber } from '../lib/format'
import { imageUrl, srcSet } from '../lib/imageUrl'
import '../styles/pages-market.css'

function DetailSkeleton() {
  return (
    <div className="ag-detail" role="status" aria-label="Loading crop">
      <div><Skeleton height="auto" style={{ aspectRatio: '4 / 3', borderRadius: 'var(--r-lg)' }} /></div>
      <div className="ag-detail__info"><Skeleton width="60%" height={36} /><Skeleton width="35%" height={28} /><SkeletonText lines={4} /><Skeleton height={220} /></div>
    </div>
  )
}

function Gallery({ images, name }) {
  const [i, setI] = useState(0)
  const list = images.length ? images : [null]
  const current = list[Math.min(i, list.length - 1)]
  return (
    <div className="ag-gallery">
      <img className="ag-gallery__main" src={imageUrl(current, { width: 900 })} srcSet={srcSet(current, [480, 720, 1080])} sizes="(max-width: 52rem) 100vw, 40rem" width="900" height="675" alt={`${name}, photo ${i + 1} of ${list.length}`} decoding="async" />
      {list.length > 1 && (
        <div className="ag-gallery__thumbs" role="group" aria-label="Crop photos">
          {list.map((src, idx) => (
            <button key={idx} type="button" className="ag-gallery__thumb" aria-current={idx === i} aria-label={`Show photo ${idx + 1}`} onClick={() => setI(idx)}>
              <img src={imageUrl(src, { width: 160 })} width="72" height="72" alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CropDetailCard() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading, error, refetch } = useFetch(`/crops/${id}`)

  const back = <Link to="/features/MarketAccess" className="ag-back"><LuArrowLeft aria-hidden="true" width="16" height="16" />Back to the market</Link>

  if (loading) return <>{back}<DetailSkeleton /></>
  if (error) {
    return <>{back}<ErrorState error={error} title={error.status === 404 ? 'This crop is no longer listed' : 'Could not load this crop'} message={error.status === 404 ? 'The seller may have removed it. Browse the market for similar crops.' : undefined} onRetry={error.status === 404 ? undefined : refetch} /></>
  }
  if (!data) return null

  const crop = cropView(data)
  const isOwner = Boolean(user?.id) && crop.sellerId === user.id

  return (
    <>
      {back}
      <div className="ag-detail">
        <Gallery images={crop.images} name={crop.name} />
        <div className="ag-detail__info">
          <div>
            <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginBottom: 'var(--s-2)' }}>
              <Badge tone={statusTone(crop.status)}>{crop.status}</Badge>
              {crop.organic && <Badge tone="success"><LuLeaf aria-hidden="true" />Organic</Badge>}
            </div>
            <h1>{crop.name}</h1>
          </div>
          <div className="ag-detail__price">{formatINR(crop.price)} <small>per {crop.unit}</small></div>
          <p className="ag-detail__desc">{crop.description}</p>

          <ul className="ag-ledger" aria-label="Crop details">
            <li className="ag-ledger__row"><span className="ag-ledger__label">Category</span><span className="ag-ledger__value">{categoryLabel(crop.category)}</span></li>
            <li className="ag-ledger__row"><span className="ag-ledger__label">In stock</span><span className="ag-ledger__value">{formatNumber(crop.quantity)} {crop.unit}</span></li>
            <li className="ag-ledger__row"><span className="ag-ledger__label">Grown organically</span><span className="ag-ledger__value">{crop.organic ? 'Yes' : 'No'}</span></li>
            {crop.state && <li className="ag-ledger__row"><span className="ag-ledger__label">Location</span><span className="ag-ledger__value">{crop.state}</span></li>}
            <li className="ag-ledger__row"><span className="ag-ledger__label">Listed</span><span className="ag-ledger__value">{formatDate(crop.createdAt)}</span></li>
            {crop.seller?.name && <li className="ag-ledger__row"><span className="ag-ledger__label">Sold by</span><span className="ag-ledger__value">{crop.seller.name}</span></li>}
          </ul>

          <OrderPanel key={crop.id} crop={crop} isOwner={isOwner} />
          {!isOwner && crop.seller && <Card flat><small className="ag-muted">The seller&apos;s phone number is shared once they accept your order.</small></Card>}
        </div>
      </div>
    </>
  )
}
