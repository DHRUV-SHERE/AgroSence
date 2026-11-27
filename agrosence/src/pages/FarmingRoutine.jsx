/**
 * Farming routine (AppLayout). Daily and seasonal planner. Tasks are stored on this device only
 * (localStorage, per user), so nothing here touches the API.
 */
import { LuInfo } from 'react-icons/lu'
import '../styles/pages-tools.css'
import { useAuth } from '../context/AuthContext'
import { Alert, Tabs } from '../components/ui'
import DailyPlanner from '../components/routine/DailyPlanner'
import SeasonPlanner from '../components/routine/SeasonPlanner'
import { useRoutine } from '../components/routine/useRoutine'

export default function FarmingRoutine() {
  const { user } = useAuth()
  const routine = useRoutine(user?.id)

  return (
    <>
      <div className="ag-pagehead">
        <div>
          <h1>Farming <span className="ag-em">routine</span></h1>
          <p>Plan the day and the season. Tick things off as you go.</p>
        </div>
      </div>

      {routine.saveFailed && (
        <Alert tone="danger">This browser is blocking storage, so your tasks will be lost when you close the page.</Alert>
      )}

      <Tabs
        label="Planner"
        tabs={[
          { id: 'daily', label: 'Every day', content: <DailyPlanner routine={routine} /> },
          { id: 'season', label: 'Seasons', content: <SeasonPlanner routine={routine} /> },
        ]}
      />

      <p className="ag-help" style={{ marginTop: 'var(--s-6)' }}>
        <LuInfo aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} /> Tasks are saved on this device only. Season dates are typical for most of India; your local dates may differ.
      </p>
    </>
  )
}
