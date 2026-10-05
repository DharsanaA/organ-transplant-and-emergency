import { useHospital } from '../../context/HospitalContext'

export default function RequireHospital({ children }) {
  const { selectedHospitalId, selectedHospital } = useHospital()

  if (!selectedHospitalId || !selectedHospital) {
    // The message above (in HospitalBar) already explains why — keep this
    // one short so it doesn't repeat the same explanation twice.
    return null
  }
  return children
}
