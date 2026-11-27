/** States and union territories that have a map tile, with a URL slug. "All States" is the national list. */
const files = import.meta.glob('../../assets/scheme/*.{jpeg,png}', { eager: true, query: '?url', import: 'default' })
const img = (file) => files[`../../assets/scheme/${file}`]

const RAW = [
  ['All States', 'India.jpeg'], ['Andhra Pradesh', 'AndhraPradesh.jpeg'], ['Arunachal Pradesh', 'ArunachalPradesh.jpeg'],
  ['Assam', 'Asssam.jpeg'], ['Bihar', 'Bihar.jpeg'], ['Chhattisgarh', 'Chhattisgarh.png'], ['Delhi', 'Delhi.jpeg'],
  ['Goa', 'Goa.png'], ['Gujarat', 'Gujarat.jpeg'], ['Haryana', 'Haryana.jpeg'], ['Himachal Pradesh', 'Himachal Pradesh.jpeg'],
  ['Jharkhand', 'Jharkhand.jpeg'], ['Karnataka', 'Karnataka.jpeg'], ['Kerala', 'Kerala.jpeg'],
  ['Madhya Pradesh', 'MadhyaPradesh.jpeg'], ['Maharashtra', 'Maharastra.jpeg'], ['Manipur', 'Manipur.jpeg'],
  ['Meghalaya', 'Meghalaya.png'], ['Mizoram', 'Mizoram.jpeg'], ['Nagaland', 'Nagaland.jpeg'], ['Odisha', 'Odisha.png'],
  ['Punjab', 'Punjab.jpeg'], ['Rajasthan', 'Rajasthan.jpeg'], ['Sikkim', 'Sikkim.png'], ['Tamil Nadu', 'Tamil Nadu.jpeg'],
  ['Telangana', 'Telangana.jpeg'], ['Tripura', 'Tripura.jpeg'], ['Uttar Pradesh', 'UP.jpeg'],
  ['Uttarakhand', 'Uttarakhand.jpeg'], ['West Bengal', 'West Bengal.png'],
]

export const slugify = (name) => String(name).trim().toLowerCase().replace(/\s+/g, '-')

export const STATES = RAW.map(([name, file]) => ({ name, slug: slugify(name), image: img(file) }))

/** Resolve a URL param ("tamil-nadu", "Tamil%20Nadu", "All-States") to a state, or null. */
export function stateFromParam(param = '') {
  let decoded = param
  try { decoded = decodeURIComponent(param) } catch { /* keep raw */ }
  const s = slugify(decoded)
  return STATES.find((x) => x.slug === s) || null
}
