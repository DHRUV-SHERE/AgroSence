/**
 * My listings (AppLayout, route /product). GET /crops/mine; edit (PUT /crops/:id), mark sold / relist
 * (PUT cropStatus) and delete (DELETE /crops/:id) with confirmation and toasts.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LuPencil, LuSprout, LuTrash2 } from 'react-icons/lu'
import { useFetch, invalidate } from '../hooks/useFetch'
import { http } from '../lib/api'
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Modal, Pagination, SkeletonTableRow, statusTone, useToast } from '../components/ui'
import CropForm from '../components/marketaccess/CropForm'
import { categoryLabel, cropView } from '../components/marketaccess/cropMeta'
import { formatDate, formatINR, formatNumber } from '../lib/format'
import { imageUrl } from '../lib/imageUrl'
import '../styles/pages-market.css'

export default function Product() {
  const toast = useToast()
  const [page, setPage] = useState(1)
  const { data, meta, loading, error, refetch } = useFetch('/crops/mine', { params: { page, limit: 10, sort: '-createdAt' }, ttl: 0 })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busyId, setBusyId] = useState('')
  const crops = (Array.isArray(data) ? data : []).map(cropView)

  const afterChange = () => { invalidate('/crops'); refetch() }

  const toggleStatus = async (c) => {
    const next = c.status === 'Available' ? 'Sold' : 'Available'
    setBusyId(c.id)
    try {
      await http.put(`/crops/${c.id}`, { cropStatus: next })
      toast.success(next === 'Sold' ? `${c.name} is hidden from the market.` : `${c.name} is back on the market.`)
      afterChange()
    } catch (e) {
      toast.error(e.message)
    } finally { setBusyId('') }
  }

  const remove = async () => {
    const c = deleting
    setBusyId(c.id)
    try {
      await http.delete(`/crops/${c.id}`)
      toast.success(`${c.name} was deleted.`)
      setDeleting(null)
      if (crops.length === 1 && page > 1) setPage(page - 1)
      afterChange()
    } catch (e) {
      toast.error(e.message)
    } finally { setBusyId('') }
  }

  return (
    <>
      <div className="ag-pagehead">
        <div>
          <h1>My <span className="ag-em">listings</span></h1>
          <p>Crops you are selling. Edit the price or stock any time; mark a crop sold to hide it from buyers.</p>
        </div>
        <Button as={Link} to="/CropSell" variant="primary" icon={<LuSprout aria-hidden="true" />}>List a crop</Button>
      </div>

      {loading ? <SkeletonTableRow cols={3} rows={5} />
        : error ? <ErrorState error={error} title="Could not load your listings" onRetry={refetch} />
          : !crops.length ? <EmptyState icon={LuSprout} title="You have not listed any crops" message="List a crop with photos and a price. It appears on the market straight away." action={<Button as={Link} to="/CropSell" variant="primary">List your first crop</Button>} />
            : (
              <>
                <ul className="ag-rows">
                  {crops.map((c) => (
                    <li className="ag-row" key={c.id}>
                      <img className="ag-row__img" src={imageUrl(c.images[0], { width: 160 })} width="88" height="88" alt="" loading="lazy" decoding="async" />
                      <div className="ag-row__main">
                        <h3><Link to={`/features/MarketAccess/product/${c.id}`}>{c.name}</Link></h3>
                        <span className="ag-row__sub">{categoryLabel(c.category)} · {formatNumber(c.quantity)} {c.unit} in stock · listed {formatDate(c.createdAt)}</span>
                      </div>
                      <div className="ag-row__side">
                        <strong className="ag-num">{formatINR(c.price)} / {c.unit}</strong>
                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                      </div>
                      <div className="ag-row__actions">
                        <Button size="sm" icon={<LuPencil aria-hidden="true" />} onClick={() => setEditing(c)}>Edit</Button>
                        <Button size="sm" loading={busyId === c.id && !deleting} onClick={() => toggleStatus(c)}>{c.status === 'Available' ? 'Mark as sold' : 'Put back on market'}</Button>
                        <Button size="sm" variant="danger" icon={<LuTrash2 aria-hidden="true" />} onClick={() => setDeleting(c)}>Delete</Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="ag-pagerwrap"><Pagination meta={meta} onPageChange={setPage} /></div>
              </>
            )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.name}` : ''} size="lg">
        {editing && (
          <CropForm
            crop={editing}
            onCancel={() => setEditing(null)}
            onSaved={(saved) => { toast.success(`${saved.cropName} was updated.`); setEditing(null); afterChange() }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        danger
        title={deleting ? `Delete ${deleting.name}?` : ''}
        message="The listing is removed for good. Orders already placed keep their record."
        confirmLabel="Delete listing"
        loading={Boolean(deleting) && busyId === deleting.id}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
