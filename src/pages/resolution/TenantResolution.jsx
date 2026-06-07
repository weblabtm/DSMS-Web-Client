import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dsmsApi } from '../../shared/api/dsms-api'
import { useTenantStore } from '../../shared/store/tenantStore'
import { useUiStore } from '../../shared/store/uiStore'

export default function TenantResolution() {
  const { tenantSlug } = useParams()
  const navigate = useNavigate()
  const setTenant = useTenantStore((state) => state.setTenant)
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  useEffect(() => {
    let active = true
    showLoader('Verifying school status...')

    const verifyTenant = async () => {
      try {
        if (!tenantSlug) {
          throw new Error('Tenant slug is missing')
        }
        
        const tenant = await dsmsApi.getTenantBySlug(tenantSlug)
        
        if (!active) return

        if (tenant && tenant.isActive) {
          setTenant(tenant)
          hideLoader()
          navigate(`/${encodeURIComponent(tenantSlug)}/role-routing`, { replace: true })
        } else {
          hideLoader()
          navigate(`/tenant-error?type=suspended&slug=${encodeURIComponent(tenantSlug)}`, { replace: true })
        }
      } catch (err) {
        if (!active) return
        hideLoader()
        navigate(`/tenant-error?type=not-found&slug=${encodeURIComponent(tenantSlug || '')}`, { replace: true })
      }
    }

    verifyTenant()

    return () => {
      active = false
    }
  }, [tenantSlug, navigate, setTenant, showLoader, hideLoader])

  return <div className="min-h-screen bg-slate-950" />
}
