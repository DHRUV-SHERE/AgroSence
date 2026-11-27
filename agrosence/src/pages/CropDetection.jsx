/**
 * Crop detection (AppLayout). POST /crop-detect (multipart field "image") -> { scientificName, commonNames[], description, image|null }.
 * 503 = identification service not configured, 404 = could not identify. Both get a plain-language message.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { LuImagePlus, LuLeaf, LuRotateCcw, LuScanSearch } from 'react-icons/lu'
import '../styles/pages-tools.css'
import { http } from '../lib/api'
import { Alert, Badge, Button, Card, Skeleton, SkeletonText } from '../components/ui'
import { cx } from '../lib/cx'
import sample from '../assets/Feature/Crop Detection.webp'

const MAX_MB = 5
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

function checkFile(file) {
  if (!TYPES.includes(file.type)) return 'Use a JPG, PNG or WebP photo.'
  if (file.size > MAX_MB * 1024 * 1024) return `That photo is ${(file.size / 1048576).toFixed(1)} MB. Choose one under ${MAX_MB} MB.`
  return ''
}

function friendly(e) {
  if (e.status === 503) return { tone: 'info', text: 'Plant identification is not switched on for this server yet. Your photo was not saved. Please try again later.' }
  if (e.status === 404) return { tone: 'info', text: 'We could not tell what this plant is. Try a closer, well-lit photo of one leaf, flower or fruit.' }
  if (e.status === 413) return { tone: 'danger', text: `That photo is too large. Choose one under ${MAX_MB} MB.` }
  if (e.status === 429) return { tone: 'danger', text: 'You have checked a lot of photos. Please wait a little and try again.' }
  return { tone: 'danger', text: e.message }
}

export default function CropDetection() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [fileError, setFileError] = useState('')
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [problem, setProblem] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const pick = useCallback((f) => {
    if (!f) return
    const err = checkFile(f)
    setResult(null); setProblem(null); setFileError(err)
    if (err) { setFile(null); setPreview(''); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const reset = () => {
    setFile(null); setPreview(''); setResult(null); setProblem(null); setFileError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const detect = async () => {
    if (!file) { setFileError('Choose a photo first.'); return }
    const body = new FormData()
    body.append('image', file)
    setBusy(true); setProblem(null); setResult(null)
    try {
      const { data } = await http.post('/crop-detect', body)
      setResult(data)
    } catch (e) {
      setProblem(friendly(e))
    } finally {
      setBusy(false)
    }
  }

  const names = Array.isArray(result?.commonNames) ? result.commonNames.filter(Boolean) : []

  return (
    <>
      <div className="ag-pagehead">
        <div>
          <h1>Check a <span className="ag-em">plant</span></h1>
          <p>Take or upload a clear photo. We tell you what it is and a little about it.</p>
        </div>
      </div>

      <div className="ag-tool">
        <Card as="section" aria-labelledby="cd-up">
          <h2 id="cd-up" className="ag-card__title">Your photo</h2>

          <label
            className={cx('ag-drop', drag && 'is-drag', preview && 'has-img')}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]) }}
          >
            <input
              ref={inputRef}
              className="ag-drop__input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => pick(e.target.files?.[0])}
              aria-describedby="cd-hint"
              aria-invalid={fileError ? true : undefined}
            />
            {preview ? (
              <>
                <img src={preview} alt="Preview of the photo you chose" />
                {busy && <span className="ag-drop__scan" aria-hidden="true" />}
              </>
            ) : (
              <span className="ag-drop__empty">
                <LuImagePlus aria-hidden="true" />
                <strong>Drop a photo here or tap to choose</strong>
                <span>On a phone this opens your camera and gallery.</span>
              </span>
            )}
          </label>
          <p id="cd-hint" className="ag-help ag-drop__hint">JPG, PNG or WebP, up to {MAX_MB} MB.{file ? ` ${file.name}` : ''}</p>
          {fileError && <p className="ag-error" role="alert">{fileError}</p>}

          <div className="ag-cluster" style={{ marginTop: 'var(--s-4)' }}>
            <Button variant="primary" icon={<LuScanSearch aria-hidden="true" />} loading={busy} onClick={detect} disabled={!file}>
              {busy ? 'Looking closely' : 'Identify plant'}
            </Button>
            {(file || result) && <Button variant="ghost" icon={<LuRotateCcw aria-hidden="true" />} onClick={reset} disabled={busy}>Start over</Button>}
          </div>
        </Card>

        <section aria-labelledby="cd-res" aria-live="polite" className="ag-tool__result">
          <h2 id="cd-res" className="ag-sr-only">Result</h2>
          {busy && (
            <Card aria-busy="true">
              <Skeleton height={28} width="60%" />
              <div style={{ margin: 'var(--s-4) 0' }}><Skeleton height={16} width="40%" /></div>
              <SkeletonText lines={4} />
            </Card>
          )}
          {!busy && problem && <Alert tone={problem.tone}>{problem.text}</Alert>}
          {!busy && !result && (
            <Card flat className="ag-howto">
              <img src={sample} alt="" width="640" height="420" loading="lazy" decoding="async" />
              <h3>How to get a good answer</h3>
              <ol>
                <li>Fill the frame with one leaf, flower or fruit.</li>
                <li>Use daylight. Avoid shadows and blur.</li>
                <li>Press Identify plant and wait a few seconds.</li>
              </ol>
              <p className="ag-muted">This is a guide, not a lab test. For disease or pest problems, ask an expert.</p>
            </Card>
          )}
          {!busy && result && (
            <Card as="article" className="ag-found">
              {result.image && <img src={result.image} alt={`Reference of ${result.scientificName}`} width="640" height="360" loading="lazy" decoding="async" />}
              <Badge tone="success"><LuLeaf aria-hidden="true" /> Identified</Badge>
              <h3 className="ag-found__name">{result.scientificName || 'Unknown plant'}</h3>
              {names.length > 0 && (
                <p className="ag-found__names">
                  <span className="ag-muted">Also called</span>{' '}
                  {names.map((n) => <Badge key={n} tone="brand">{n}</Badge>)}
                </p>
              )}
              {result.description && <p className="ag-found__desc">{result.description}</p>}
            </Card>
          )}
        </section>
      </div>
    </>
  )
}
