import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { useTenantStore } from '../../shared/store/tenantStore'
import { useUiStore } from '../../shared/store/uiStore'

export default function RoleRouting() {
  const { tenantSlug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const tenant = useTenantStore((state) => state.tenant)
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  useEffect(() => {
    showLoader('Routing to workspace...')

    if (!user) {
      hideLoader()
      navigate('/login', { replace: true })
      return
    }

    // Evaluate features, plans, and roles
    // Placeholder hooks for plans and flags
    const plan = tenant?.plan || 'Standard'
    const featureFlags = tenant?.featureFlags || []
    const userRole = user.roles?.[0] || 'Student'

    // Direct different roles to appropriate layouts.
    // In the future, these can map to specific routes like /student/dashboard or /instructor/dashboard
    let targetPath = `/${encodeURIComponent(tenantSlug)}/dashboard`

    console.log(`Evaluated workspace routing: plan=${plan}, role=${userRole}, features=${JSON.stringify(featureFlags)}`)

    hideLoader()
    navigate(targetPath, { replace: true })
  }, [user, tenant, tenantSlug, navigate, showLoader, hideLoader])

  return <div className="min-h-screen bg-slate-950" />
}
