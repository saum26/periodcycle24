import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMantras } from '../hooks/useMantras'
import styles from './MantraList.module.css'

export default function MantraList() {
  const { mantras, loading, addMantra, deleteMantra } = useMantras()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('108')
  const [mantraText, setMantraText] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    await addMantra(name.trim(), parseInt(target) || 108, mantraText.trim() || null)
    setName('')
    setTarget('108')
    setMantraText('')
    setAdding(false)
  }

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Mantras</h1>

      <form onSubmit={handleAdd} className={styles.form}>
        <input
          className={styles.input}
          placeholder="Mantra name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className={styles.input}
          type="number"
          placeholder="Target count"
          value={target}
          min={1}
          onChange={e => setTarget(e.target.value)}
        />
        <textarea
          className={styles.input}
          placeholder="Mantra text (optional)"
          value={mantraText}
          rows={2}
          onChange={e => setMantraText(e.target.value)}
        />
        <button className={styles.addBtn} type="submit" disabled={adding || !name.trim()}>
          {adding ? '…' : 'Add'}
        </button>
      </form>

      {mantras.length === 0 && (
        <p className={styles.empty}>No mantras yet. Add one above.</p>
      )}

      <ul className={styles.list}>
        {mantras.map(m => (
          <li key={m.id} className={styles.item}>
            <button className={styles.mantraBtn} onClick={() => navigate(`/counter/${m.id}`)}>
              <span className={styles.mantraName}>{m.name}</span>
              <span className={styles.target}>Goal: {m.target_count}</span>
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => deleteMantra(m.id)}
              aria-label="Delete"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
