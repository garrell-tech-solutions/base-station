import React, { useEffect, useState } from 'react'

/* ── tiny markdown parser ─────────────────────────────── */
function parseMd(md) {
  const lines = md.split('\n')
  const elements = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      if (inList) { elements.push({ type: 'ul-end' }); inList = false }
      elements.push({ type: 'h3', text: line.slice(4) })
    } else if (line.startsWith('## ')) {
      if (inList) { elements.push({ type: 'ul-end' }); inList = false }
      elements.push({ type: 'h2', text: line.slice(3) })
    } else if (line.startsWith('# ')) {
      if (inList) { elements.push({ type: 'ul-end' }); inList = false }
      elements.push({ type: 'h1', text: line.slice(2) })
    } else if (line.startsWith('- ')) {
      if (!inList) { elements.push({ type: 'ul-start' }); inList = true }
      elements.push({ type: 'li', text: line.slice(2) })
    } else if (line.trim() === '') {
      if (inList) { elements.push({ type: 'ul-end' }); inList = false }
    } else {
      if (inList) { elements.push({ type: 'ul-end' }); inList = false }
      elements.push({ type: 'p', text: line })
    }
  }
  if (inList) elements.push({ type: 'ul-end' })
  return elements
}

function inline(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

function MdView({ md }) {
  const els = parseMd(md)
  const out = []
  let listItems = []

  for (let i = 0; i < els.length; i++) {
    const e = els[i]
    if (e.type === 'h1') out.push(<h1 key={i}>{e.text}</h1>)
    else if (e.type === 'h2') out.push(<h2 key={i}>{e.text}</h2>)
    else if (e.type === 'h3') out.push(<h3 key={i}>{e.text}</h3>)
    else if (e.type === 'li') listItems.push(<li key={i} dangerouslySetInnerHTML={{ __html: inline(e.text) }} />)
    else if (e.type === 'ul-start') listItems = []
    else if (e.type === 'ul-end') { out.push(<ul key={i}>{listItems}</ul>); listItems = [] }
    else if (e.type === 'p') out.push(<p key={i} dangerouslySetInnerHTML={{ __html: inline(e.text) }} />)
  }
  return <>{out}</>
}

/* ── data sources ─────────────────────────────────────── */
const SOURCES = [
  { key: 'florida', label: 'Florida Law', dir: 'florida-law-learning' },
  { key: 'broward', label: 'Broward County', dir: 'broward-learning' },
  { key: 'local',   label: 'Coral Springs / Local', dir: 'local-learning' },
  { key: 'daily',   label: 'Daily Report', dir: 'learning' },
]

async function loadIndex(dir) {
  try {
    const r = await fetch(`/${dir}/index.json`)
    if (!r.ok) throw new Error('no index')
    return await r.json()
  } catch {
    // fallback: try a known daily file
    try {
      const today = new Date().toISOString().slice(0, 10)
      const r2 = await fetch(`/${dir}/Florida-${today}.md`)
      if (r2.ok) return [{ file: `Florida-${today}.md` }]
    } catch {}
    return []
  }
}

async function loadFile(dir, file) {
  const r = await fetch(`/${dir}/${file}`)
  if (!r.ok) return ''
  return r.text()
}

/* ── app ──────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState('florida')
  const [entries, setEntries] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  const src = SOURCES.find(s => s.key === tab)

  useEffect(() => {
    setLoading(true)
    setContent('')
    loadIndex(src.dir).then(items => {
      setEntries(items)
      if (items.length > 0) {
        loadFile(src.dir, items[0].file).then(md => { setContent(md); setLoading(false) })
      } else {
        setLoading(false)
      }
    })
  }, [tab])

  function pick(file) {
    setLoading(true)
    loadFile(src.dir, file).then(md => { setContent(md); setLoading(false) })
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Base Station Learning</h1>
        <p>Florida &middot; Broward &middot; Coral Springs</p>
      </div>

      <div className="tabs">
        {SOURCES.map(s => (
          <button key={s.key} className={`tab ${tab === s.key ? 'active' : ''}`} onClick={() => setTab(s.key)}>
            {s.label}
          </button>
        ))}
      </div>

      {entries.length > 1 && (
        <div className="tabs">
          {entries.map(e => (
            <button key={e.file} className="tab" onClick={() => pick(e.file)}>{e.file}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="empty">Loading…</div>
      ) : content ? (
        <div className="card">
          <MdView md={content} />
        </div>
      ) : (
        <div className="empty">No entries yet for {src.label}.</div>
      )}
    </div>
  )
}
