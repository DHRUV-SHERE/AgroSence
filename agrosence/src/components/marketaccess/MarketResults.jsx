/** Browse results: loading skeleton, error with retry, empty state, grid and pagination. */
import { Link } from 'react-router-dom'
import { LuSearchX } from 'react-icons/lu'
import { Button, EmptyState, ErrorState, Pagination, ProductGridSkeleton } from '../ui'
import ProductGrid from '../product/ProductGrid'
import '../../styles/pages-market.css'

export default function MarketResults({ crops, meta, loading, error, refetch, filtered, onReset, onPage, userId }) {
  if (loading) return <ProductGridSkeleton count={8} />
  if (error) return <ErrorState error={error} title="Could not load the market" onRetry={refetch} />
  if (!crops.length) {
    return filtered ? (
      <EmptyState icon={LuSearchX} title="No crops match these filters" message="Try a wider price range, another category, or clear the filters." action={<Button onClick={onReset}>Clear filters</Button>} />
    ) : (
      <EmptyState title="No crops for sale yet" message="Be the first. List what you have harvested and buyers will find it here." action={<Button as={Link} to="/CropSell" variant="primary">List a crop</Button>} />
    )
  }
  return (
    <>
      <ProductGrid crops={crops} userId={userId} />
      <div className="ag-pagerwrap"><Pagination meta={meta} onPageChange={onPage} /></div>
    </>
  )
}
