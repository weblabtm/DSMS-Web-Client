import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { useUiStore } from '../../shared/store/uiStore'

export default function UserTypeResolution() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  useEffect(() => {
    showLoader('Resolving user profile...')

    if (!user) {
      hideLoader()
      navigate('/login', { replace: true })
      return
    }

    const isSuperAdmin = user.roles?.includes('Super Admin')
    if (isSuperAdmin) {
      hideLoader()
      navigate('/super-admin/dashboard', { replace: true })
    } else {
      const tenantSlug = user.tenantId
      if (tenantSlug) {
        hideLoader()
        navigate(`/${encodeURIComponent(tenantSlug)}/resolve-tenant`, { replace: true })
      } else {
        hideLoader()
        navigate('/tenant-error?type=not-found', { replace: true })
      }
    }
  }, [user, navigate, showLoader, hideLoader])

  return <div className="min-h-screen bg-slate-950" />
}
