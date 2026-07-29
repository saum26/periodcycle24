import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MantraList from './pages/MantraList'
import Counter from './pages/Counter'
import History from './pages/History'
import { useWeeklyCleanup } from './hooks/useWeeklyCleanup'

export default function App() {
  useWeeklyCleanup()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MantraList />} />
        <Route path="/counter/:id" element={<Counter />} />
        <Route path="/history/:id" element={<History />} />
      </Routes>
    </BrowserRouter>
  )
}
