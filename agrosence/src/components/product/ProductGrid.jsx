import ProductCard from './ProductCard'
import '../../styles/pages-market.css'

export default function ProductGrid({ crops, userId }) {
  return (
    <ul className="ag-grid" style={{ '--min': '15rem', listStyle: 'none' }}>
      {crops.map((c) => (
        <li key={c.id} style={{ display: 'flex' }}>
          <div style={{ flex: 1, display: 'flex' }}>
            <div style={{ flex: 1 }}><ProductCard crop={c} mine={Boolean(userId) && c.sellerId === userId} /></div>
          </div>
        </li>
      ))}
    </ul>
  )
}
