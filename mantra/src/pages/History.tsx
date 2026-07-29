import { useNavigate, useParams } from 'react-router-dom'
import { useMantras } from '../hooks/useMantras'
import { useAllDailyCounts } from '../hooks/useDailyCount'
import styles from './History.module.css'

export default function History() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { mantras } = useMantras()
  const mantra = mantras.find(m => m.id === id)
  const { history, loading } = useAllDailyCounts(id!)

  if (loading || !mantra) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(`/counter/${id}`)}>← Back</button>
      <h2 className={styles.title}>{mantra.name}</h2>
      <p className={styles.subtitle}>History</p>

      {history.length === 0 && (
        <p className={styles.empty}>No records yet.</p>
      )}

      <ul className={styles.list}>
        {history.map(entry => (
          <li key={entry.id} className={styles.item}>
            <span className={styles.date}>{entry.date}</span>
            <span className={styles.count}>
              {entry.count}
              <span className={styles.target}> / {mantra.target_count}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
