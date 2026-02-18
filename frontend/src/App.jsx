import React, { useEffect, useState } from 'react'

function MdView({ md }) {
  const lines = md.split('\n')
  const out = []
  let listItems = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('### ')) {
      if (inList) { out.push(<ul key={'ul'+i}>{listItems}</ul>); listItems = []; inList = false }
      out.push(<h3 key={i}>{line.slice(4)}</h3>)
    } else if (line.startsWith('## ')) {
      if (inList) { out.push(<ul key={'ul'+i}>{listItems}</ul>); listItems = []; inList = false }
      out.push(<h2 key={i}>{line.slice(3)}</h2>)
    } else if (line.startsWith('# ')) {
      if (inList) { out.push(<ul key={'ul'+i}>{listItems}</ul>); listItems = []; inList = false }
      out.push(<h1 key={i}>{line.slice(2)}</h1>)
    } else if (line.startsWith('- ')) {
      if (!inList) inList = true
      listItems.push(<li key={i}>{line.slice(2)}</li>)
    } else if (line.trim() === '') {
      if (inList) { out.push(<ul key={'ul'+i}>{listItems}</ul>); listItems = []; inList = false }
    } else {
      if (inList) { out.push(<ul key={'ul'+i}>{listItems}</ul>); listItems = []; inList = false }
      out.push(<p key={i}>{line}</p>)
    }
  }
  if (inList) out.push(<ul key="ul-end">{listItems}</ul>)
  return <>{out}</>
}

const TABS = [
  { key: 'florida', label: 'Florida Law', file: 'florida-law-learning/florida.md' },
  { key: 'broward', label: 'Broward County', file: 'broward-learning/broward.md' },
  { key: 'local', label: 'Coral Springs / Local', file: 'local-learning/coral-springs.md' },
  { key: 'daily', label: 'Daily Report', file: 'learning/Florida-2026-02-18.md' },
]

export default function App() {
  const [tab, setTab] = useState('florida')
  const [md, setMd] = useState('')
  const [loading, setLoading] = useState(true)

  const src = TABS.find(t => t.key === tab)

  useEffect(() => {
    setLoading(true)
    setMd('')
    fetch('./' + src.file)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.text()
      })
      .then(text => { setMd(text); setLoading(false) })
      .catch(() => { setMd(''); setLoading(false) })
  }, [tab])

  return (
    <div className="app">
      <div className="header">
        <h1>Base Station Learning</h1>
        <p>Florida &middot; Broward &middot; Coral Springs</p>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={'tab' + (tab === t.key ? ' active' : '')}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">Loading…</div>
      ) : md ? (
        <div className="card">
          <MdView md={md} />
        </div>
      ) : (
        <div className="empty">No content yet for {src.label}.</div>
      )}
    </div>
  )
}
