/**
 * Market filters (search, category, state, organic, price range, sort). Values live in the URL; this
 * component only keeps a draft of the typed fields (search, prices) and commits them on submit/blur.
 */
import { useEffect, useState } from 'react'
import { LuListFilter, LuSearch } from 'react-icons/lu'
import { Button, Checkbox, Input, Select } from '../ui'
import { INDIAN_STATES } from '../../lib/validate'
import { CATEGORIES, SORTS } from './cropMeta'
import '../../styles/pages-market.css'

export default function MarketFilters({ values, onChange, onReset, activeCount }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ q: values.q, minPrice: values.minPrice, maxPrice: values.maxPrice })

  // Keep the draft in step when the URL changes from outside (reset, back button).
  useEffect(() => { setDraft({ q: values.q, minPrice: values.minPrice, maxPrice: values.maxPrice }) }, [values.q, values.minPrice, values.maxPrice])

  const commit = (e) => { e?.preventDefault(); onChange({ q: draft.q.trim(), minPrice: draft.minPrice, maxPrice: draft.maxPrice }) }
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  const priceBad = draft.minPrice && draft.maxPrice && Number(draft.minPrice) > Number(draft.maxPrice)

  return (
    <form className="ag-mfilters" data-open={open} onSubmit={commit} role="search" aria-label="Filter crops">
      <div className="ag-mfilters__top">
        <Input label="Search crops" type="search" name="q" value={draft.q} onChange={set('q')} placeholder="Wheat, tomato, basmati…" autoComplete="off" />
        <Button type="submit" variant="primary" icon={<LuSearch aria-hidden="true" />}>Search</Button>
        <Button className="ag-mfilters__toggle" icon={<LuListFilter aria-hidden="true" />} aria-expanded={open} aria-controls="mfilters-more" onClick={() => setOpen((o) => !o)}>
          Filters{activeCount ? ` (${activeCount})` : ''}
        </Button>
      </div>

      <div className="ag-mfilters__more" id="mfilters-more">
        <Select label="Category" value={values.category} onChange={(e) => onChange({ category: e.target.value })} placeholder="All categories" options={CATEGORIES} />
        <Select label="State" value={values.state} onChange={(e) => onChange({ state: e.target.value })} placeholder="All states" options={INDIAN_STATES} />
        <Input label="Min price (₹)" type="number" inputMode="decimal" min="0" value={draft.minPrice} onChange={set('minPrice')} onBlur={commit} error={priceBad ? 'Must not be above the max price.' : ''} />
        <Input label="Max price (₹)" type="number" inputMode="decimal" min="0" value={draft.maxPrice} onChange={set('maxPrice')} onBlur={commit} />
        <Select label="Sort by" value={values.sort} onChange={(e) => onChange({ sort: e.target.value })} options={SORTS} />
        <div className="ag-mfilters__checkwrap">
          <Checkbox label="Organic only" checked={values.organic} onChange={(e) => onChange({ organic: e.target.checked })} />
        </div>
        {activeCount > 0 && <Button variant="ghost" onClick={onReset}>Clear filters</Button>}
      </div>
    </form>
  )
}
