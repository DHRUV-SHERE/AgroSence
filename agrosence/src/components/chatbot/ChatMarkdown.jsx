/**
 * Minimal, safe Markdown for chat answers. Supports paragraphs, #/## headings, "-"/"*"/"•" bullets,
 * "1." numbered lists, **bold**, *italic* and `code`. Builds React elements only (no innerHTML),
 * so model output can never inject markup.
 */
import { Fragment } from 'react'

const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\s][^*]*\*)/g

function inline(text, keyBase) {
  return text.split(INLINE).filter(Boolean).map((part, i) => {
    const key = `${keyBase}-${i}`
    if (/^\*\*[^*]+\*\*$/.test(part) || /^__[^_]+__$/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>
    if (/^`[^`]+`$/.test(part)) return <code key={key}>{part.slice(1, -1)}</code>
    if (/^\*[^*\s][^*]*\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>
    return <Fragment key={key}>{part}</Fragment>
  })
}

function parse(source) {
  const lines = String(source || '').replace(/\r/g, '').split('\n')
  const blocks = []
  let list = null
  let para = []
  const flushPara = () => { if (para.length) { blocks.push({ type: 'p', text: para.join(' ') }); para = [] } }
  const flushList = () => { if (list) { blocks.push(list); list = null } }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushPara(); flushList(); continue }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { flushPara(); flushList(); continue }
    const heading = /^#{1,6}\s+(.*)$/.exec(line)
    const bullet = /^[-*•]\s+(.*)$/.exec(line)
    const numbered = /^(\d+)[.)]\s+(.*)$/.exec(line)
    if (heading) { flushPara(); flushList(); blocks.push({ type: 'h', text: heading[1] }); continue }
    if (bullet) {
      flushPara()
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] } }
      list.items.push(bullet[1]); continue
    }
    if (numbered) {
      flushPara()
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] } }
      list.items.push(numbered[2]); continue
    }
    // A continuation line inside a list item stays with that item.
    if (list && raw.startsWith(' ')) { list.items[list.items.length - 1] += ` ${line}`; continue }
    flushList()
    para.push(line)
  }
  flushPara(); flushList()
  return blocks
}

export default function ChatMarkdown({ text }) {
  const blocks = parse(text)
  return (
    <div className="ag-md">
      {blocks.map((b, i) => {
        if (b.type === 'h') return <p key={i} className="ag-md__h">{inline(b.text, i)}</p>
        if (b.type === 'ul') return <ul key={i}>{b.items.map((t, j) => <li key={j}>{inline(t, `${i}-${j}`)}</li>)}</ul>
        if (b.type === 'ol') return <ol key={i}>{b.items.map((t, j) => <li key={j}>{inline(t, `${i}-${j}`)}</li>)}</ol>
        return <p key={i}>{inline(b.text, i)}</p>
      })}
    </div>
  )
}
