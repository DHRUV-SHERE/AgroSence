/**
 * Skeleton loaders (shimmer, respects reduced motion). Mirror the final layout to avoid layout shift.
 *   <Skeleton width="60%" height={20} />   <SkeletonText lines={3} />   <SkeletonAvatar size={40} />
 *   <SkeletonCard />   <SkeletonTableRow cols={5} rows={6} />
 *   <SkeletonGrid count={8} min="16rem"><ProductCardSkeleton /></SkeletonGrid>   // or <ProductGridSkeleton count={8} />
 *   <ProductCardSkeleton />
 */
import { cx } from '../../lib/cx'

export function Skeleton({ width = '100%', height, circle, className, style }) {
  return <span className={cx('ag-skel', circle && 'ag-skel--circle', className)} style={{ width, height, ...style }} aria-hidden="true" />
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="ag-skel-text" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} />)}
    </div>
  )
}

export const SkeletonAvatar = ({ size = 40 }) => <Skeleton circle width={size} height={size} />

export function SkeletonCard() {
  return (
    <div className="ag-card" aria-hidden="true" style={{ display: 'grid', gap: 'var(--s-3)' }}>
      <Skeleton width="40%" height={20} />
      <SkeletonText lines={3} />
    </div>
  )
}

export function SkeletonTableRow({ cols = 4, rows = 1 }) {
  return Array.from({ length: rows }, (_, r) => (
    <div className="ag-skel-row" style={{ '--cols': cols }} key={r} aria-hidden="true">
      {Array.from({ length: cols }, (_, c) => <Skeleton key={c} width={c === 0 ? '80%' : '60%'} />)}
    </div>
  ))
}

export function ProductCardSkeleton() {
  return (
    <div className="ag-skel-prod" aria-hidden="true">
      <Skeleton height={170} style={{ borderRadius: 0 }} />
      <div>
        <Skeleton width="70%" height={18} />
        <Skeleton width="40%" />
        <Skeleton width="55%" height={22} />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6, min = '16rem', children }) {
  return (
    <div className="ag-grid" style={{ '--min': min }} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => <div key={i}>{children || <SkeletonCard />}</div>)}
    </div>
  )
}

export const ProductGridSkeleton = ({ count = 8 }) => <SkeletonGrid count={count} min="15rem"><ProductCardSkeleton /></SkeletonGrid>
