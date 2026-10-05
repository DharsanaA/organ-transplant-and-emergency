import { createContext, useContext, useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { SEED_HOSPITALS } from '../config/constants'

const HospitalContext = createContext(null)

export function HospitalProvider({ children }) {
  // Starts pre-populated with a fixed list of real hospitals so the
  // dropdown isn't empty on first run. Admin can still add more.
  const [hospitals, setHospitals] = useLocalStorage('oc_hospitals', SEED_HOSPITALS)

  // NOT persisted to localStorage on purpose: a Hospital Coordinator's
  // "selected hospital" is really just their own account's assigned
  // hospitalId (set once at registration). Keeping this as in-memory
  // state and re-deriving it from the logged-in user avoids one
  // coordinator's session leaking into another's if they share a browser.
  const [selectedHospitalId, setSelectedHospitalId] = useState('')

  function addHospital({ name, location, contact }) {
    const hospital = {
      id: crypto.randomUUID(),
      name,
      location,
      contact,
      status: 'Active',
      createdAt: new Date().toISOString(),
    }
    setHospitals(prev => [...prev, hospital])
    return hospital
  }

  function updateHospitalStatus(id, status) {
    setHospitals(prev => prev.map(h => (h.id === id ? { ...h, status } : h)))
  }

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || null

  useEffect(() => {
    if (selectedHospitalId && selectedHospitalId !== '__all__' && !selectedHospital) {
      setSelectedHospitalId('')
    }
  }, [selectedHospitalId, selectedHospital])

  const value = {
    hospitals,
    addHospital,
    updateHospitalStatus,
    selectedHospitalId,
    setSelectedHospitalId,
    selectedHospital,
  }

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>
}

export function useHospital() {
  const ctx = useContext(HospitalContext)
  if (!ctx) throw new Error('useHospital must be used inside <HospitalProvider>')
  return ctx
}
