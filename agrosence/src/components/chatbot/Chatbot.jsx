/**
 * AgroBot chat widget. Lazy-loaded from App.jsx after first idle; stays mounted across route changes so the
 * conversation lives in memory for the session. POST /chatbot { message } -> data.answer (auth optional).
 * Accessibility: dialog landmark, aria-live log, Escape closes, focus moves to input on open and back to the
 * launcher on close, full-screen on phones.
 */
import ChatMarkdown from './ChatMarkdown'
import { useEffect, useRef, useState } from 'react'
import { LuBot, LuMessageCircle, LuSend, LuX } from 'react-icons/lu'
import { http } from '../../lib/api'
import { IconButton } from '../ui'

const SUGGESTIONS = [
  'Which crops suit black soil?',
  'How do I control aphids on cotton?',
  'When should I sow wheat in Gujarat?',
  'How do I check for PM-Kisan eligibility?',
]
const WELCOME = { id: 0, role: 'bot', text: 'Namaste! I am AgroBot. Ask me anything about crops, pests, soil, irrigation or schemes.' }

const chatError = (err) => {
  if (err.status === 429) return 'You are asking very quickly. Please wait a moment and try again.'
  if (err.status === 503) return 'AgroBot is not available right now. Please try again later.'
  if (err.isNetwork || !err.status) return 'Sorry, I could not reach the server. Check your connection and try again.'
  return 'Sorry, something went wrong. Please try again.'
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const logRef = useRef(null)
  const inputRef = useRef(null)
  const fabRef = useRef(null)
  const idRef = useRef(1)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else if (wasOpen.current) fabRef.current?.focus()
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const send = async (raw) => {
    const message = raw.trim()
    if (!message || busy) return
    setMessages((m) => [...m, { id: idRef.current++, role: 'user', text: message }])
    setText('')
    setBusy(true)
    try {
      const { data } = await http.post('/chatbot', { message })
      const answer = data?.answer ?? data?.data?.answer ?? 'I could not find an answer to that. Try asking in a different way.'
      setMessages((m) => [...m, { id: idRef.current++, role: 'bot', text: answer }])
    } catch (err) {
      setMessages((m) => [...m, { id: idRef.current++, role: 'bot', error: true, text: chatError(err) }])
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e) => { e.preventDefault(); send(text) }

  if (!open) {
    return (
      <button ref={fabRef} type="button" className="ag-chat__fab" onClick={() => setOpen(true)} aria-label="Open AgroBot chat" aria-haspopup="dialog">
        <LuMessageCircle aria-hidden="true" /><span>Ask AgroBot</span>
      </button>
    )
  }

  return (
    <section className="ag-chat" role="dialog" aria-label="AgroBot chat">
      <header className="ag-chat__head">
        <LuBot aria-hidden="true" width="26" height="26" />
        <div><strong>AgroBot</strong><small>Farming help, any time</small></div>
        <IconButton label="Close chat" size="sm" onClick={() => setOpen(false)}><LuX /></IconButton>
      </header>

      <div className="ag-chat__log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((m) => (
          <div key={m.id} className={`ag-msg ag-msg--${m.role}${m.error ? ' ag-msg--error' : ''}`}>{m.role === 'bot' && !m.error ? <ChatMarkdown text={m.text} /> : m.text}</div>
        ))}
        {busy && <div className="ag-msg ag-msg--bot" role="status" aria-label="AgroBot is typing"><span className="ag-typing"><i /><i /><i /></span></div>}
      </div>

      {messages.length === 1 && (
        <div className="ag-chat__chips" aria-label="Suggested questions">
          {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}
        </div>
      )}

      <form className="ag-chat__form" onSubmit={onSubmit}>
        <label className="ag-sr-only" htmlFor="ag-chat-input">Your question</label>
        <input id="ag-chat-input" ref={inputRef} className="ag-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about farming…" maxLength={500} autoComplete="off" />
        <IconButton label="Send message" type="submit" variant="outline" disabled={busy || !text.trim()}><LuSend /></IconButton>
      </form>
    </section>
  )
}
