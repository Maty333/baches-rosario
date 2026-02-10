import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Loading from './Loading.jsx'

const RouteGuard = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <Loading />

  if (!isAuthenticated) return <Navigate to='/login' />

  if (requireAdmin && !isAdmin) return <Navigate to='/' />

  return children
}

export default RouteGuard
