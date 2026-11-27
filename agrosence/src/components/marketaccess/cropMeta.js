/** Shared marketplace constants and small helpers (no React). */
export const CATEGORIES = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains' },
  { value: 'herbs', label: 'Herbs' },
  { value: 'other', label: 'Other' },
]

export const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'bunch', 'each']

export const SORTS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'cropSellingPrice', label: 'Price: low to high' },
  { value: '-cropSellingPrice', label: 'Price: high to low' },
  { value: 'cropName', label: 'Name: A to Z' },
  { value: '-cropQuantity', label: 'Most stock' },
]

export const MAX_IMAGES = 4
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const categoryLabel = (c = '') => CATEGORIES.find((x) => x.value === String(c).toLowerCase())?.label ?? c

/** Normalise a contract crop into the fields the UI needs. */
export const cropView = (c) => ({
  id: c.id,
  name: c.cropName,
  description: c.cropDescription,
  category: c.cropCategory,
  price: Number(c.cropSellingPrice) || 0,
  unit: c.cropUnit,
  quantity: Number(c.cropQuantity) || 0,
  organic: c.organic ?? c.grownOrganically === 'Yes',
  images: Array.isArray(c.cropImages) ? c.cropImages : [],
  status: c.cropStatus || 'Available',
  state: c.state || c.seller?.state || '',
  sellerId: c.seller?.id ?? c.userId,
  seller: c.seller,
  createdAt: c.createdAt,
})
