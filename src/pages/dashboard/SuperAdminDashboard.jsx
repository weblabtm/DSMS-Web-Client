import { Link, useNavigate } from 'react-router-dom'
import { Shield, Database, Layers3, Building2, Users, ArrowRight, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useAuth } from '../../shared/hooks/useAuth'
import { Button } from '../../shared/ui/button.jsx'

const statCards = [
    { label: 'Active Tenants', value: '128', icon: Building2 },
    { label: 'Managed Users', value: '8.4k', icon: Users },
    { label: 'Cluster Health', value: 'Healthy', icon: Database },
    { label: 'Role Policies', value: '42', icon: Layers3 },
]

export default function SuperAdminDashboard() {
    const { currentRole, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (currentRole !== 'Super Admin') {
            navigate('/dashboard', { replace: true })
        }
    }, [currentRole, navigate])

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-[420px] w-[420px] md:h-[600px] md:w-[600px] rounded-full bg-rose-500/10 blur-[140px]" />
                <div className="absolute bottom-0 right-10 h-[360px] w-[360px] md:h-[500px] md:w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
            </div>

            <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-4 md:px-6">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20">
                            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-slate-500">Super Admin</div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-100">Global Control Center</div>
                        </div>
                        <div className="block sm:hidden text-xs sm:text-sm font-semibold text-slate-100 whitespace-nowrap">
                            Control Center
                        </div>
                    </div>

                    <Button
                        onClick={() => logout()}
                        variant="outline"
                        size="sm"
                        className="border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white text-xs sm:text-sm"
                    >
                        <LogOut className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Sign Out
                    </Button>
                </div>
            </header>

            <main className="mx-auto grid max-w-7xl gap-6 sm:gap-8 px-3 sm:px-4 md:px-6 py-8 sm:py-12 lg:grid-cols-3">
                <section className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-5 sm:p-6 md:p-8 shadow-2xl shadow-rose-950/10 backdrop-blur-xl">
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-rose-400">Production Overview</p>
                        <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            Welcome back, platform operator.
                        </h1>
                        <p className="mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-slate-400">
                            This workspace is isolated from tenant subdomains. Use it to oversee tenant lifecycle, security posture,
                            role policies, and system-wide operations without entering a tenant dashboard.
                        </p>

                        <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
                            <Link to="/dashboard">
                                <Button variant="outline" className="border-slate-800 text-slate-200 hover:bg-slate-900 text-xs sm:text-sm">
                                    Open Tenant Workspace <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </Link>
                            <Button className="bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-90 text-xs sm:text-sm">
                                Security Console
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
                        {statCards.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="rounded-2xl border border-slate-900 bg-slate-900/35 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
                                <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-slate-950 text-rose-400">
                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-slate-500">{label}</div>
                                <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-extrabold text-white">{value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="space-y-3 sm:space-y-4 lg:col-span-1">
                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-4 sm:p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="rounded-2xl bg-rose-500/10 p-2.5 sm:p-3 text-rose-400">
                                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div>
                                <div className="text-xs sm:text-sm font-semibold text-white">Tenant Management</div>
                                <div className="text-[10px] sm:text-xs text-slate-500">Create, suspend, and inspect tenant spaces</div>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-300">
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-3 sm:px-4 py-2.5 sm:py-3">
                                <span>Tenant routing</span>
                                <span className="text-emerald-400">Enabled</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-3 sm:px-4 py-2.5 sm:py-3">
                                <span>Slug ownership</span>
                                <span className="text-emerald-400">Enforced</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-3 sm:px-4 py-2.5 sm:py-3">
                                <span>Tenant isolation</span>
                                <span className="text-emerald-400">UI segmented</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-rose-950/30 bg-rose-950/10 p-4 sm:p-6 text-xs sm:text-sm text-rose-100 backdrop-blur-xl">
                        <p className="font-semibold text-white">Security note</p>
                        <p className="mt-1.5 sm:mt-2 leading-5 sm:leading-6 text-rose-100/80">
                            Super admin access stays on the base host. Do not route this workspace through tenant subdomains.
                        </p>
                    </div>
                </aside>
            </main>
        </div>
    )
}
