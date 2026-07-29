import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMantras } from '../hooks/useMantras'
import { useDailyCount } from '../hooks/useDailyCount'
import styles from './Counter.module.css'

function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}

export default function Counter() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { mantras } = useMantras()
  const mantra = mantras.find(m => m.id === id)
  const { count, loading, increment, reset } = useDailyCount(id!)
  const [justCompleted, setJustCompleted] = useState(false)

  const handleTap = async () => {
    await increment()
    if (mantra && count + 1 >= mantra.target_count) {
      vibrate([200, 100, 200, 100, 400])
      setJustCompleted(true)
    } else {
      vibrate(30)
    }
  }

  useEffect(() => {
    if (justCompleted) {
      const t = setTimeout(() => setJustCompleted(false), 3000)
      return () => clearTimeout(t)
    }
  }, [justCompleted])

  if (loading || !mantra) return <div className={styles.loading}>Loading…</div>

  const progress = Math.min(count / mantra.target_count, 1)
  const pct = Math.round(progress * 100)

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/')}>← Back</button>

      <h2 className={styles.name}>{mantra.name}</h2>
      {mantra.mantra_text && (
        <p className={styles.mantraText}>{mantra.mantra_text}</p>
      )}

      <div className={styles.progress}>
        <svg viewBox="0 0 120 120" className={styles.ring}>
          <circle cx="60" cy="60" r="52" className={styles.trackCircle} />
          <circle
            cx="60" cy="60" r="52"
            className={styles.progressCircle}
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress)}`}
          />
        </svg>
        <div className={styles.countDisplay}>
          <span className={styles.current}>{count}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.target}>{mantra.target_count}</span>
        </div>
      </div>

      {justCompleted && (
        <div className={styles.badge}>Goal reached!</div>
      )}

      <button className={styles.tapBtn} onPointerDown={handleTap}>
        {pct >= 100 ? '✓' : '+1'}
      </button>

      <div className={styles.actions}>
        <button
          className={styles.secondaryBtn}
          onClick={() => navigate(`/history/${id}`)}
        >
          View history
        </button>
        <button className={styles.resetBtn} onClick={reset}>
          Reset today
        </button>
      </div>
    </div>
  )
}
