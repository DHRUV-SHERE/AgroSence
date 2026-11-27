/** Market page head: title, one-line purpose, and the seller entry points. */
import { Link } from 'react-router-dom'
import { LuList, LuSprout } from 'react-icons/lu'
import { Button } from '../ui'
import '../../styles/pages-market.css'

export default function MarketHead() {
  return (
    <div className="ag-pagehead">
      <div>
        <h1>The <span className="ag-em">crop market</span></h1>
        <p>Buy straight from farmers across India. Send an order request; the seller replies with a yes or no.</p>
      </div>
      <div className="ag-row-actions" style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
        <Button as={Link} to="/product" icon={<LuList aria-hidden="true" />}>My listings</Button>
        <Button as={Link} to="/CropSell" variant="primary" icon={<LuSprout aria-hidden="true" />}>List a crop</Button>
      </div>
    </div>
  )
}
