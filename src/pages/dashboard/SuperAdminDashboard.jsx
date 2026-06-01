import { Link, useNavigate } from 'react-router-dom'
import { Shield, Database, Layers3, Building2, Users, BarChart3, ArrowRight, LogOut } from 'lucide-react'
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
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-[140px]" />
                <div className="absolute bottom-0 right-10 h-[360px] w-[360px] rounded-full bg-indigo-500/10 blur-[120px]" />
            </div>

            <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20">
                            <Shield className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Super Admin</div>
                            <div className="text-sm font-semibold text-slate-100">Global Control Center</div>
                        </div>
                    </div>

                    <Button
                        onClick={() => logout()}
                        variant="outline"
                        size="sm"
                        className="border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white"
                    >
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>
            </header>

            <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
                <section className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-8 shadow-2xl shadow-rose-950/10 backdrop-blur-xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-rose-400">Production Overview</p>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Welcome back, platform operator.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                            This workspace is isolated from tenant subdomains. Use it to oversee tenant lifecycle, security posture,
                            role policies, and system-wide operations without entering a tenant dashboard.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/dashboard">
                                <Button variant="outline" className="border-slate-800 text-slate-200 hover:bg-slate-900">
                                    Open Tenant Workspace <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Button className="bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-90">
                                Security Console
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {statCards.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="rounded-2xl border border-slate-900 bg-slate-900/35 p-5 shadow-xl backdrop-blur-xl">
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-rose-400">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</div>
                                <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="space-y-4 lg:col-span-1">
                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-400">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Tenant Management</div>
                                <div className="text-xs text-slate-500">Create, suspend, and inspect tenant spaces</div>
                            </div>
                        </div>
                        <div className="mt-5 space-y-3 text-sm text-slate-300">
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-4 py-3">
                                <span>Tenant routing</span>
                                <span className="text-emerald-400">Enabled</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-4 py-3">
                                <span>Slug ownership</span>
                                <span className="text-emerald-400">Enforced</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-4 py-3">
                                <span>Tenant isolation</span>
                                <span className="text-emerald-400">UI segmented</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-rose-950/30 bg-rose-950/10 p-6 text-sm text-rose-100 backdrop-blur-xl">
                        <p className="font-semibold text-white">Security note</p>
                        <p className="mt-2 leading-6 text-rose-100/80">
                            Super admin access stays on the base host. Do not route this workspace through tenant subdomains.
                        </p>
                    </div>
                </aside>
            </main>
        </div>
    )
}
