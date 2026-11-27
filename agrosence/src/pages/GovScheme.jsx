/** Government schemes index: state-image grid with search. Each tile links to /state-schemes/:slug. No API call here. */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LuArrowRight, LuSearchX } from 'react-icons/lu'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { STATES } from '../components/content/states'
import { Button, EmptyState, Input } from '../components/ui'
import '../styles/pages-content.css'

export default function GovScheme() {
  const [query, setQuery] = useState('')
  const q = useDebouncedValue(query).trim().toLowerCase()
  const shown = useMemo(() => STATES.filter((s) => s.name.toLowerCase().includes(q)), [q])
  const national = STATES[0]

  return (
    <>
      <header className="ag-pagehead">
        <div>
          <h1>Government schemes, <span className="ag-em">state by state</span></h1>
          <p>Pick your state to see the schemes you can apply for, who is eligible and what you receive.</p>
        </div>
        <Button as={Link} to={`/state-schemes/${national.slug}`} variant="secondary" icon={<LuArrowRight aria-hidden="true" />}>Schemes for all states</Button>
      </header>

      <div className="ag-toolbar">
        <Input
          wrapperClassName="ag-toolbar__search"
          label="Search states"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="For example, Gujarat"
          autoComplete="off"
        />
        <p className="ag-muted ag-toolbar__count" role="status" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'state' : 'states'}
        </p>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={LuSearchX} title="No state matches that" message="Check the spelling, or clear the search to see every state." action={<Button onClick={() => setQuery('')}>Clear search</Button>} />
      ) : (
        <ul className="ag-stategrid">
          {shown.map((s) => (
            <li key={s.slug}>
              <Link to={`/state-schemes/${s.slug}`} className="ag-statetile">
                <img src={s.image} alt="" width="160" height="160" loading="lazy" decoding="async" />
                <span>{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
