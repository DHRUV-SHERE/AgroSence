/**
 * Create / edit a crop listing. Create: POST /crops (multipart, cropImages 1-4). Edit: PUT /crops/:id
 * (multipart; picking new photos replaces the old ones). Used by pages/CropSell and the edit dialog in pages/Product.
 */
import { useEffect, useRef, useState } from 'react'
import { LuImagePlus, LuX } from 'react-icons/lu'
import { Alert, Badge, Button, Checkbox, IconButton, Input, Select, Textarea } from '../ui'
import { http } from '../../lib/api'
import { invalidate } from '../../hooks/useFetch'
import { rules, validate } from '../../lib/validate'
import { imageUrl } from '../../lib/imageUrl'
import { CATEGORIES, IMAGE_TYPES, MAX_IMAGES, MAX_IMAGE_BYTES, UNITS } from './cropMeta'
import '../../styles/pages-market.css'

const positive = (label) => (v) => (Number(v) > 0 ? '' : `${label} must be more than 0.`)
const SCHEMA = {
  cropName: [rules.required('Crop name'), rules.minLength(2, 'Crop name')],
  cropCategory: [rules.required('Category')],
  cropDescription: [rules.required('Description'), rules.minLength(10, 'Description')],
  cropSellingPrice: [rules.required('Price'), positive('Price')],
  cropQuantity: [rules.required('Quantity'), positive('Quantity')],
  cropUnit: [rules.required('Unit')],
}

function ImagePicker({ files, setFiles, existing, error, setError }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  const add = (list) => {
    const incoming = [...list]
    const bad = incoming.find((f) => !IMAGE_TYPES.includes(f.type))
    if (bad) return setError(`"${bad.name}" is not a JPG, PNG or WebP image.`)
    const big = incoming.find((f) => f.size > MAX_IMAGE_BYTES)
    if (big) return setError(`"${big.name}" is larger than 5 MB.`)
    const next = [...files, ...incoming]
    if (next.length > MAX_IMAGES) setError(`You can add up to ${MAX_IMAGES} photos. Extra photos were skipped.`)
    else setError('')
    setFiles(next.slice(0, MAX_IMAGES))
  }

  const showExisting = !files.length && existing?.length
  return (
    <div className="ag-pickimg">
      <span className="ag-label" id="pick-label">Photos <span className="ag-req" aria-hidden="true">*</span></span>
      <label
        className="ag-pickimg__drop"
        data-drag={drag}
        data-invalid={Boolean(error)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files) }}
      >
        <LuImagePlus aria-hidden="true" />
        <strong>{files.length ? 'Add more photos' : existing?.length ? 'Replace photos' : 'Choose photos'}</strong>
        <span>JPG, PNG or WebP, up to 5 MB each. 1 to {MAX_IMAGES} photos; the first is the cover.</span>
        <input ref={inputRef} type="file" accept={IMAGE_TYPES.join(',')} multiple aria-labelledby="pick-label" aria-describedby={error ? 'pick-err' : undefined} aria-invalid={error ? true : undefined} onChange={(e) => { add(e.target.files); e.target.value = '' }} />
      </label>
      {error && <span className="ag-error" id="pick-err" role="alert">{error}</span>}

      {(files.length > 0 || showExisting) && (
        <ul className="ag-pickimg__list" aria-label="Selected photos">
          {files.length > 0
            ? previews.map((src, i) => (
              <li className="ag-pickimg__item" key={src}>
                <img src={src} alt={`Photo ${i + 1}: ${files[i]?.name}`} width="112" height="112" />
                <IconButton size="sm" label={`Remove photo ${i + 1}`} onClick={() => { setFiles(files.filter((_, j) => j !== i)); setError('') }}><LuX /></IconButton>
                {i === 0 && <Badge className="ag-pickimg__cover">Cover</Badge>}
              </li>
            ))
            : existing.map((src, i) => (
              <li className="ag-pickimg__item" key={src}>
                <img src={imageUrl(src, { width: 224 })} alt={`Current photo ${i + 1}`} width="112" height="112" loading="lazy" />
                {i === 0 && <Badge className="ag-pickimg__cover">Cover</Badge>}
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default function CropForm({ crop, onSaved, onCancel, submitLabel }) {
  const editing = Boolean(crop)
  const [v, setV] = useState({
    cropName: crop?.name ?? '',
    cropCategory: crop ? String(crop.category).toLowerCase() : '',
    cropDescription: crop?.description ?? '',
    cropSellingPrice: crop?.price ?? '',
    cropQuantity: crop?.quantity ?? '',
    cropUnit: crop?.unit ?? 'kg',
    organic: crop?.organic ?? false,
  })
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [imgError, setImgError] = useState('')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const on = (k) => (e) => {
    setV((s) => ({ ...s, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate(v, SCHEMA)
    setErrors(errs)
    const noImage = !editing && !files.length
    if (noImage) setImgError('Add at least one photo so buyers can see the crop.')
    if (Object.keys(errs).length || noImage) {
      setFormError('Please fix the highlighted fields.')
      document.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    setFormError('')
    const body = new FormData()
    body.append('cropName', v.cropName.trim())
    body.append('cropCategory', v.cropCategory)
    body.append('cropDescription', v.cropDescription.trim())
    body.append('cropSellingPrice', String(v.cropSellingPrice))
    body.append('cropQuantity', String(v.cropQuantity))
    body.append('cropUnit', v.cropUnit)
    body.append('grownOrganically', v.organic ? 'true' : 'false')
    files.forEach((f) => body.append('cropImages', f))

    setBusy(true)
    try {
      const { data } = editing ? await http.put(`/crops/${crop.id}`, body) : await http.post('/crops', body)
      invalidate('/crops')
      onSaved?.(data)
    } catch (err) {
      const fe = err.fieldErrors || {}
      const { cropImages, ...rest } = fe
      if (cropImages) setImgError(cropImages)
      setErrors((x) => ({ ...x, ...rest }))
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {formError && <Alert tone="danger">{formError}</Alert>}
      <div className="ag-formgrid" style={{ marginTop: formError ? 'var(--s-4)' : 0 }}>
        <Input wrapperClassName="ag-span" label="Crop name" name="cropName" value={v.cropName} onChange={on('cropName')} error={errors.cropName} placeholder="e.g. Basmati rice" maxLength={100} required />
        <Select label="Category" name="cropCategory" value={v.cropCategory} onChange={on('cropCategory')} error={errors.cropCategory} placeholder="Choose a category" options={CATEGORIES} required />
        <div className="ag-mfilters__checkwrap" style={{ alignSelf: 'end' }}>
          <Checkbox label="Grown organically" checked={v.organic} onChange={(e) => setV((s) => ({ ...s, organic: e.target.checked }))} />
        </div>
        <Textarea wrapperClassName="ag-span" label="Description" name="cropDescription" rows={4} value={v.cropDescription} onChange={on('cropDescription')} error={errors.cropDescription} help="Variety, harvest date, how it was grown. Buyers read this first." maxLength={2000} required />
        <Input label="Price per unit (₹)" name="cropSellingPrice" type="number" inputMode="decimal" min="0" step="any" value={v.cropSellingPrice} onChange={on('cropSellingPrice')} error={errors.cropSellingPrice} required />
        <Select label="Unit" name="cropUnit" value={v.cropUnit} onChange={on('cropUnit')} error={errors.cropUnit} options={UNITS} required />
        <Input label="Quantity available" name="cropQuantity" type="number" inputMode="decimal" min="0" step="any" value={v.cropQuantity} onChange={on('cropQuantity')} error={errors.cropQuantity} required />
        <div className="ag-span">
          <ImagePicker files={files} setFiles={setFiles} existing={crop?.images} error={imgError} setError={setImgError} />
        </div>
      </div>
      <div className="ag-form-actions">
        {onCancel && <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>}
        <Button type="submit" variant="primary" loading={busy}>{submitLabel || (editing ? 'Save changes' : 'List crop')}</Button>
      </div>
    </form>
  )
}
