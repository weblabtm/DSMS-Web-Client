import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Calendar, BookOpen, Award, Clock, CreditCard, MessageSquare, TrendingUp, LogOut, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../shared/hooks/useAuth'
import { Button } from '../../shared/ui/button.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../shared/ui/card.jsx'
import { Badge } from '../../shared/ui/badge.jsx'

const statCards = [
    { label: 'Completed Lessons', value: '24', icon: BookOpen },
    { label: 'Hours Driven', value: '18.5', icon: Clock },
    { label: 'Test Score', value: '92%', icon: Award },
    { label: 'Next Lesson', value: '2d', icon: Calendar },
]

const upcomingLessons = [
    { date: 'Tomorrow', time: '10:00 AM', instructor: 'Alex Rodriguez', type: 'Highway Practice', status: 'confirmed' },
    { date: 'Friday', time: '2:00 PM', instructor: 'Sarah Chen', type: 'Parallel Parking', status: 'pending' },
    { date: 'Monday', time: '9:00 AM', instructor: 'Alex Rodriguez', type: 'City Driving', status: 'scheduled' },
]

const learningProgress = [
    { topic: 'Traffic Signs', progress: 100, status: 'completed' },
    { topic: 'Basic Maneuvers', progress: 85, status: 'in-progress' },
    { topic: 'Highway Driving', progress: 60, status: 'in-progress' },
    { topic: 'Night Driving', progress: 30, status: 'not-started' },
    { topic: 'Emergency Procedures', progress: 0, status: 'not-started' },
]

export default function TenantDashboard() {
    const { currentRole, logout, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (currentRole === 'Super Admin') {
            navigate('/super-admin-dashboard', { replace: true })
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
                            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-slate-500">Student Portal</div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-100">Learning Dashboard</div>
                        </div>
                        <div className="block sm:hidden text-xs sm:text-sm font-semibold text-slate-100 whitespace-nowrap">
                            My Dashboard
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
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-rose-400">Welcome Back</p>
                        <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            Ready to continue your journey?
                        </h1>
                        <p className="mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-slate-400">
                            Track your driving lessons, monitor your progress, and stay on top of your certification goals. Your next lesson is scheduled for tomorrow at 10:00 AM.
                        </p>

                        <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
                            <Button className="bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-90 text-xs sm:text-sm">
                                Book New Lesson
                            </Button>
                            <Button variant="outline" className="border-slate-800 text-slate-200 hover:bg-slate-900 text-xs sm:text-sm">
                                View Schedule <Calendar className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" /> Upcoming Lessons
                            </h2>
                            <Link to="/schedule" className="text-xs sm:text-sm text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1">
                                View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {upcomingLessons.map((lesson, index) => (
                                <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4 hover:border-slate-700 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs sm:text-sm font-semibold text-white">{lesson.type}</div>
                                                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                                                    {lesson.date} at {lesson.time} · {lesson.instructor}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge 
                                            variant={lesson.status === 'confirmed' ? 'success' : lesson.status === 'pending' ? 'warning' : 'default'}
                                            className="text-[9px] sm:text-[10px] py-0 px-2 shrink-0"
                                        >
                                            {lesson.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" /> Learning Progress
                            </h2>
                            <Link to="/progress" className="text-xs sm:text-sm text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1">
                                View Details <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {learningProgress.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm font-medium text-slate-200">{item.topic}</span>
                                        <span className="text-[10px] sm:text-xs text-slate-400">{item.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-300 ${
                                                item.progress === 100 ? 'bg-emerald-500' : 
                                                item.progress > 0 ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 
                                                'bg-slate-800'
                                            }`}
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="space-y-3 sm:space-y-4 lg:col-span-1">
                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
                            <div className="rounded-2xl bg-rose-500/10 p-2.5 sm:p-3 text-rose-400">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div>
                                <div className="text-xs sm:text-sm font-semibold text-white">Quick Stats</div>
                                <div className="text-[10px] sm:text-xs text-slate-500">Your performance overview</div>
                            </div>
                        </div>
                        <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-300">
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-3 sm:px-4 py-2.5 sm:py-3">
                                <span>Overall Progress</span>
                                <span className="text-emerald-400 font-semibold">68%</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-3 sm:px-4 py-2.5 sm:py-3">
                                <span>Lessons This Month</span>
                                <span className="text-rose-400 font-semibold">8</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-3 sm:px-4 py-2.5 sm:py-3">
                                <span>Certification Ready</span>
                                <span className="text-slate-400">In 2 weeks</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
                            <div className="rounded-2xl bg-rose-500/10 p-2.5 sm:p-3 text-rose-400">
                                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div>
                                <div className="text-xs sm:text-sm font-semibold text-white">Messages</div>
                                <div className="text-[10px] sm:text-xs text-slate-500">From your instructor</div>
                            </div>
                        </div>
                        <div className="space-y-2.5 sm:space-y-3">
                            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4">
                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs sm:text-sm shrink-0">
                                        AR
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs sm:text-sm font-semibold text-white truncate">Alex Rodriguez</div>
                                        <div className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">Great progress on highway driving! Let's focus on...</div>
                                        <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1">2 hours ago</div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4">
                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs sm:text-sm shrink-0">
                                        SC
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs sm:text-sm font-semibold text-white truncate">Sarah Chen</div>
                                        <div className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">Don't forget to review the parallel parking...</div>
                                        <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1">Yesterday</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full mt-4 border-slate-800 text-slate-200 hover:bg-slate-900 text-xs sm:text-sm">
                            View All Messages
                        </Button>
                    </div>

                    <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
                            <div className="rounded-2xl bg-rose-500/10 p-2.5 sm:p-3 text-rose-400">
                                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div>
                                <div className="text-xs sm:text-sm font-semibold text-white">Billing</div>
                                <div className="text-[10px] sm:text-xs text-slate-500">Payment status</div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm text-slate-300">Current Package</span>
                                <Badge variant="success" className="text-[9px] sm:text-[10px] py-0 px-2">Active</Badge>
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-white mb-1">Premium Plan</div>
                            <div className="text-[10px] sm:text-xs text-slate-400 mb-3">$149/month · Renews Jan 15</div>
                            <Button variant="outline" className="w-full border-slate-800 text-slate-200 hover:bg-slate-900 text-xs sm:text-sm">
                                Manage Subscription
                            </Button>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    )
}
