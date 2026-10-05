import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import HospitalBar from './HospitalBar'

const TABS = [
  { to: '/coordinator/dashboard', label: 'Dashboard' },
  { to: '/coordinator/donors', label: 'Donors' },
  { to: '/coordinator/recipients', label: 'Recipients' },
  { to: '/coordinator/organs', label: 'Organ Inventory' },
  { to: '/coordinator/matching', label: 'Matching' },
  { to: '/coordinator/requests', label: 'Requests & Transport' },
]

export default function CoordinatorShell() {
  const { currentUser } = useAuth()
  const { setSelectedHospitalId } = useHospital()

  // A coordinator's hospital was fixed at registration — lock the shared
  // "selected hospital" state to it rather than letting them pick one.
  useEffect(() => {
    setSelectedHospitalId(currentUser.hospitalId || '')
  }, [currentUser.hospitalId, setSelectedHospitalId])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Hospital Coordinator</h1>
        <p className="page-subtitle">Managing donors, recipients, and inventory for your assigned hospital</p>
      </div>
      <HospitalBar tabs={TABS} mode="locked" />
      <Outlet />
    </div>
  )
}
