/** Marketplace crop card. The whole card is one link (stretched anchor on the title). */
import { Link } from 'react-router-dom'
import { LuLeaf, LuMapPin, LuPackage } from 'react-icons/lu'
import { Badge } from '../ui'
import { formatINR, formatNumber } from '../../lib/format'
import { imageUrl, srcSet } from '../../lib/imageUrl'
import { categoryLabel } from '../marketaccess/cropMeta'
import '../../styles/pages-market.css'

export default function ProductCard({ crop, mine }) {
  const img = crop.images[0]
  return (
    <article className="ag-crop">
      <img
        className="ag-crop__img"
        src={imageUrl(img, { width: 480 })}
        srcSet={srcSet(img, [320, 480, 720])}
        sizes="(max-width: 40rem) 100vw, 20rem"
        width="480"
        height="360"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div className="ag-crop__tags">
        {crop.organic && <Badge tone="success"><LuLeaf aria-hidden="true" />Organic</Badge>}
        {mine && <Badge tone="brand">Your listing</Badge>}
      </div>
      <div className="ag-crop__body">
        <h3 className="ag-crop__name">
          <Link to={`/features/MarketAccess/product/${crop.id}`}>{crop.name}</Link>
        </h3>
        <div className="ag-crop__price">{formatINR(crop.price)} <small>per {crop.unit}</small></div>
        <div className="ag-crop__meta">
          <span><LuPackage aria-hidden="true" />{formatNumber(crop.quantity)} {crop.unit} left</span>
          {crop.state && <span><LuMapPin aria-hidden="true" />{crop.state}</span>}
        </div>
        <small className="ag-muted">{categoryLabel(crop.category)}</small>
      </div>
    </article>
  )
}
