import { useState } from 'react'
import {
    Sparkles,
    Calendar as CalendarIcon,
    Users,
    CreditCard,
    GraduationCap,
    DollarSign,
    BarChart3,
    Clock,
    Coins,
    ArrowRight,
    Star
} from 'lucide-react'

import { Button } from '../shared/ui/button.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui/card.jsx'
import { Badge } from '../shared/ui/badge.jsx'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../shared/ui/tabs.jsx'
import { Slider } from '../shared/ui/slider.jsx'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../shared/ui/accordion.jsx'
import { Carousel } from '../shared/ui/carousel.jsx'
import Navbar from '../widgets/Navbar.jsx'

import heroDashboard from '../assets/hero-dashboard.png'

export default function Landing() {
    const [studentsCount, setStudentsCount] = useState([150])
    const [instructorsCount, setInstructorsCount] = useState([12])
    const calculatedHoursSaved = Math.round((studentsCount[0] * 0.4) + (instructorsCount[0] * 3.5))
    const calculatedMoneySaved = calculatedHoursSaved * 30

    const getPlanDetails = () => {
        if (studentsCount[0] <= 100 && instructorsCount[0] <= 5) return { name: 'Growth Core', price: '$49', billing: 'mo' }
        if (studentsCount[0] <= 400 && instructorsCount[0] <= 20) return { name: 'Professional Tier', price: '$99', billing: 'mo' }
        return { name: 'Enterprise Cloud', price: '$249', billing: 'mo' }
    }
    const recommendedPlan = getPlanDetails()

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">

            {/* ── Ambient glow blobs ── */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/5  rounded-full blur-[140px]" />
                <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-cyan-500/5   rounded-full blur-[100px]" />
            </div>

            {/* ═══════════════════════════════════════════════
          1. NAVBAR
      ═══════════════════════════════════════════════ */}
            <Navbar />

            {/* ═══════════════════════════════════════════════
          2. HERO
          mobile/tablet: single col, image below copy
          lg+:           two cols, image right
      ═══════════════════════════════════════════════ */}
            <section className="relative pt-8 sm:pt-10 pb-12 sm:pb-16 lg:pt-16 lg:pb-24 xl:pt-20 xl:pb-28 overflow-hidden">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">

                        {/* ── Left: Copy ── */}
                        <div className="flex flex-col items-start max-w-xl mx-auto lg:mx-0 text-left">

                            <Badge variant="default" className="mb-4 sm:mb-5 flex gap-1 sm:gap-1.5 py-1 px-2.5 sm:px-3 border border-indigo-500/25 bg-indigo-500/5 cursor-default text-[10px] sm:text-xs">
                                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-indigo-400 shrink-0" />
                                <span className="text-indigo-200">Normal route client mode is active.</span>
                            </Badge>

                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.08] mb-4 sm:mb-5 text-white">
                                Driving Schools,{' '}
                                <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Managed Perfectly
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed mb-6 sm:mb-8">
                                DSMS is a multi-tenant SaaS workspace enabling modern driving academies to scale operations.
                                Automate instructor rosters, handle student bookings, process digital invoices, and secure certifications effortlessly.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
                                <a href="/register" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-indigo-500/20 text-sm sm:text-base">
                                        Get Started Free <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                </a>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-sm sm:text-base">
                                    Schedule Sales Call
                                </Button>
                            </div>

                            {/* Social proof */}
                            <div className="mt-6 sm:mt-8 flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-500">
                                <div className="flex -space-x-1.5 sm:-space-x-2 shrink-0">
                                    {[
                                        ['bg-indigo-500', 'ML'],
                                        ['bg-blue-500', 'SF'],
                                        ['bg-cyan-500', 'AK'],
                                        ['bg-emerald-500', 'JD'],
                                    ].map(([color, initials], i) => (
                                        <div key={i} className={`h-6 w-6 sm:h-7 sm:w-8 rounded-full ${color} border-2 border-slate-950 flex items-center justify-center text-[8px] sm:text-[9px] sm:text-[10px] font-bold text-white`}>
                                            {initials}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] sm:text-xs sm:text-sm">Trusted by <span className="font-semibold text-slate-300">500+ academies</span> worldwide</span>
                            </div>
                        </div>

                        {/* ── Right: Dashboard image ── */}
                        <div className="relative w-full mt-6 lg:mt-0">
                            {/* Glow halo */}
                            <div className="absolute -inset-2 sm:-inset-3 lg:-inset-5 bg-gradient-to-tr from-indigo-500/10 via-blue-500/5 to-transparent rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl pointer-events-none" />

                            {/* Image frame */}
                            <div className="relative rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-800 bg-slate-950/40 p-1 sm:p-1.5 lg:p-2 shadow-[0_0_60px_rgba(79,70,229,0.15)] overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                                <img
                                    src={heroDashboard}
                                    alt="DSMS driving school management dashboard preview"
                                    className="w-full rounded-md sm:rounded-lg lg:rounded-xl border border-slate-900 shadow-2xl brightness-[0.96] block"
                                />
                            </div>

                            {/* Floating badge: live dot — only on sm+ to avoid overflow */}
                            <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 lg:-top-4 lg:-left-4 hidden sm:flex bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 shadow-xl items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs sm:text-sm font-semibold text-white">
                                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <span className="hidden sm:inline">Live scheduling active</span>
                                <span className="sm:hidden">Live</span>
                            </div>

                            {/* Floating badge: hours saved — only on md+ */}
                            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 md:-bottom-4 md:-right-4 hidden md:flex bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 shadow-xl items-center gap-1.5 sm:gap-2">
                                <div className="flex flex-col leading-tight">
                                    <span className="text-[9px] sm:text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Monthly Hours Saved</span>
                                    <span className="text-base sm:text-lg sm:text-xl font-extrabold text-indigo-400">2,400 hrs</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
          3. FEATURES GRID
          1 col → 2 col (sm) → 3 col (md)
      ═══════════════════════════════════════════════ */}
            <section id="features" className="py-12 sm:py-16 border-t border-slate-900 bg-slate-900/10">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 md:mb-4 text-white">
                            Complete Academy Operations Suite
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-slate-400">
                            Everything required to run a multi-branch driving academy in one cloud unified portal.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                        {[
                            { icon: Users, color: 'indigo', title: 'Enrollment & Progress', desc: 'Track full student lifecycles, log dynamic permit states, lesson checkpoints, and theoretical test histories.' },
                            { icon: CalendarIcon, color: 'blue', title: 'Automated Scheduling', desc: 'Avoid dual-booking errors. Pair active instructors with learner vehicles and sync shifts in real-time.' },
                            { icon: CreditCard, color: 'cyan', title: 'Invoicing & Payments', desc: 'Generate instant digital invoices, reconcile partial cash deposits, and track pending student balances.' },
                            { icon: GraduationCap, color: 'emerald', title: 'Exam Certifications', desc: 'Log practice road results, track theoretical exams, and auto-generate certified completions for licensing.' },
                            { icon: DollarSign, color: 'purple', title: 'Rosters & Payroll', desc: 'Manage instructor hourly payrolls, track driving commissions, and log branch manager profiles.' },
                            { icon: BarChart3, color: 'pink', title: 'Real-Time Reports', desc: 'Drill down on monthly profits, branch rankings, vehicle gas logs, and overall registration analytics.' },
                        ].map(({ icon: Icon, color, title, desc }) => (
                            <Card key={title} className="group hover:-translate-y-1 hover:border-slate-700 transition-all duration-300">
                                <CardHeader className="p-4 sm:p-5 md:p-6">
                                    <div className={`h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-12 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-2.5 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-${color}-400`} />
                                    </div>
                                    <CardTitle className="text-sm sm:text-base md:text-lg">{title}</CardTitle>
                                    <CardDescription className="pt-1.5 sm:pt-2 leading-relaxed text-[10px] sm:text-xs md:text-sm">{desc}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
          4. DASHBOARD SIMULATOR
      ═══════════════════════════════════════════════ */}
            <section id="simulator" className="py-12 sm:py-16 border-t border-slate-900 bg-slate-950">
                <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 text-white">
                            Try the Console Walkthrough
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-slate-400">
                            Click tabs to interact with a direct simulator of the active driving school dashboard.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Tabs defaultValue="scheduling">
                            {/* Tabs list — scrolls horizontally on xs */}
                            <div className="w-full overflow-x-auto pb-2">
                                <TabsList className="flex w-max min-w-full sm:grid sm:grid-cols-3 sm:w-full mx-auto">
                                    <TabsTrigger value="scheduling" className="text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4">Roster Scheduler</TabsTrigger>
                                    <TabsTrigger value="students" className="text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4">Student Roster</TabsTrigger>
                                    <TabsTrigger value="billing" className="text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-3 md:px-4">Quick Billing</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Tab 1: Scheduling */}
                            <TabsContent value="scheduling">
                                <Card className="border-slate-800 bg-slate-900/30 overflow-hidden shadow-2xl">
                                    <CardHeader className="bg-slate-950/40 border-b border-slate-900/80 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <CardTitle className="text-xs sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2">
                                            <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-indigo-400 shrink-0" />
                                            Dynamic Scheduling Calendar
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-4 md:p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                                            {/* Instructor A */}
                                            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-2.5 sm:p-3 md:p-4">
                                                <div className="flex justify-between items-center mb-2 sm:mb-3 gap-2">
                                                    <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 tracking-wider uppercase truncate">Alex R.</span>
                                                    <Badge variant="success" className="text-[9px] sm:text-[10px] py-0 px-1.5 sm:px-2 shrink-0">Online</Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="p-2 sm:p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs">
                                                        <div className="font-bold text-white text-[11px] sm:text-xs">09:00 – 11:00 AM</div>
                                                        <div className="text-slate-400 text-[10px] sm:text-xs mt-0.5">Jessica Miller (Manual)</div>
                                                    </div>
                                                    <div className="p-2 sm:p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                                                        <div className="font-bold text-slate-300 text-[11px] sm:text-xs">01:00 – 03:00 PM</div>
                                                        <div className="text-slate-500 text-[10px] sm:text-xs mt-0.5">David Lee (Automatic)</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Instructor B */}
                                            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 sm:p-4">
                                                <div className="flex justify-between items-center mb-3 gap-2">
                                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase truncate">Sarah M.</span>
                                                    <Badge variant="success" className="text-[10px] py-0 px-2 shrink-0">Online</Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="p-2 sm:p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs">
                                                        <div className="font-bold text-white text-[11px] sm:text-xs">10:30 AM – 12:30 PM</div>
                                                        <div className="text-slate-400 text-[10px] sm:text-xs mt-0.5">Liam Carter (Road Prep)</div>
                                                    </div>
                                                    <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                                                        <div className="font-bold text-emerald-400 text-[11px] sm:text-xs">04:00 – 05:00 PM</div>
                                                        <div className="text-slate-300 text-[10px] sm:text-xs mt-0.5">Emily Davis (Theory)</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Instructor C */}
                                            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                                                <div className="flex justify-between items-center mb-3 gap-2">
                                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase truncate">Carlos T.</span>
                                                    <Badge variant="outline" className="text-[10px] py-0 px-2 text-slate-500 shrink-0">Off-duty</Badge>
                                                </div>
                                                <div className="h-20 sm:h-24 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                                                    No active slots scheduled
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab 2: Students */}
                            <TabsContent value="students">
                                <Card className="border-slate-800 bg-slate-900/30 overflow-hidden shadow-2xl">
                                    <CardHeader className="bg-slate-950/40 border-b border-slate-900/80 px-4 sm:px-6 py-4">
                                        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 shrink-0" />
                                            Active Student Logs
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                                            <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                                                <thead>
                                                    <tr className="border-b border-slate-900 bg-slate-950/30 text-slate-400">
                                                        <th className="p-3 sm:p-4 font-bold text-[10px] sm:text-xs uppercase">Student</th>
                                                        <th className="p-3 sm:p-4 font-bold text-[10px] sm:text-xs uppercase">Instructor</th>
                                                        <th className="p-3 sm:p-4 font-bold text-[10px] sm:text-xs uppercase">Lesson Hours</th>
                                                        <th className="p-3 sm:p-4 font-bold text-[10px] sm:text-xs uppercase">Payment</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-900">
                                                    {[
                                                        { name: 'Jessica Miller', instructor: 'Alex R.', pct: 70, hrs: '14 / 20', paid: true },
                                                        { name: 'Liam Carter', instructor: 'Sarah M.', pct: 40, hrs: '8 / 20', paid: false },
                                                    ].map(({ name, instructor, pct, hrs, paid }) => (
                                                        <tr key={name}>
                                                            <td className="p-3 sm:p-4 font-semibold text-white whitespace-nowrap">{name}</td>
                                                            <td className="p-3 sm:p-4 text-slate-300 whitespace-nowrap">{instructor}</td>
                                                            <td className="p-3 sm:p-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-1.5 sm:h-2 w-16 sm:w-24 rounded-full bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                    <span className="text-[10px] sm:text-xs text-slate-300 whitespace-nowrap">{hrs} hrs</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 sm:p-4">
                                                                <Badge variant={paid ? 'success' : 'default'} className="text-[10px] sm:text-xs whitespace-nowrap">
                                                                    {paid ? 'Fully Paid' : 'Pending ($180)'}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab 3: Billing */}
                            <TabsContent value="billing">
                                <Card className="border-slate-800 bg-slate-900/30 overflow-hidden shadow-2xl">
                                    <CardHeader className="bg-slate-950/40 border-b border-slate-900/80 px-4 sm:px-6 py-4">
                                        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 shrink-0" />
                                            Dynamic Invoice Reconciler
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="max-w-md mx-auto border border-slate-800 rounded-2xl bg-slate-950 p-4 sm:p-6 shadow-xl">
                                            <div className="flex justify-between items-start sm:items-center mb-5 sm:mb-6 gap-3">
                                                <div>
                                                    <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-bold">Invoice #INV-2026-90</div>
                                                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">Date: May 31, 2026</div>
                                                </div>
                                                <Badge variant="default" className="shrink-0 text-[10px] sm:text-xs">Unreconciled</Badge>
                                            </div>
                                            <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6">
                                                <div className="flex justify-between text-[11px] sm:text-xs text-slate-400">
                                                    <span>Theoretical Prep materials</span>
                                                    <span className="font-semibold">$60.00</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] sm:text-xs text-slate-400">
                                                    <span>Manual driving lessons (10 hrs)</span>
                                                    <span className="font-semibold">$450.00</span>
                                                </div>
                                                <div className="h-px bg-slate-900 my-1" />
                                                <div className="flex justify-between text-xs sm:text-sm font-bold text-white">
                                                    <span>Total Invoice Cost</span>
                                                    <span className="text-cyan-400">$510.00</span>
                                                </div>
                                            </div>
                                            <Button className="w-full justify-center bg-cyan-600 hover:bg-cyan-500 text-xs sm:text-sm">
                                                Mark as Paid via Card
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
          5. ROI CALCULATOR
          stacks to single col on mobile
      ═══════════════════════════════════════════════ */}
            <section id="roi-calculator" className="py-16 sm:py-20 border-t border-slate-900 bg-slate-900/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4 text-white">
                            Calculate Your ROI &amp; Plan
                        </h2>
                        <p className="text-sm sm:text-base text-slate-400">
                            Input your driving school size to see recommended packages and monthly time/money savings.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto items-start md:items-center">

                        {/* Sliders */}
                        <div className="space-y-6 sm:space-y-8">
                            {[
                                { label: 'Active Students /month', value: studentsCount, set: setStudentsCount, min: 10, max: 1000, step: 10, color: 'indigo', minLabel: '10', maxLabel: '1000' },
                                { label: 'Active Instructors', value: instructorsCount, set: setInstructorsCount, min: 2, max: 50, step: 1, color: 'blue', minLabel: '2', maxLabel: '50' },
                            ].map(({ label, value, set, min, max, step, color, minLabel, maxLabel }) => (
                                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-6 shadow-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-xs sm:text-sm font-bold text-slate-200">{label}</label>
                                        <span className={`text-lg sm:text-xl font-extrabold text-${color}-400`}>{value[0]}</span>
                                    </div>
                                    <Slider min={min} max={max} step={step} value={value} onValueChange={set} />
                                    <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 mt-2 font-semibold">
                                        <span>{minLabel}</span><span>{maxLabel}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Results card */}
                        <div className="relative rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 sm:p-8 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="mb-5 sm:mb-6">
                                <Badge variant="default" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 mb-2 text-[10px] sm:text-xs">
                                    Recommended Subscription
                                </Badge>
                                <div className="text-xl sm:text-2xl font-black text-white mt-1">{recommendedPlan.name}</div>
                                <div className="flex items-baseline gap-1 mt-1.5">
                                    <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-white to-slate-400 bg-clip-text">
                                        {recommendedPlan.price}
                                    </span>
                                    <span className="text-xs sm:text-sm text-slate-500">/{recommendedPlan.billing}</span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-900 my-5 sm:my-6" />

                            {/* Stats — always 2 col, but shrink text on xs */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-800 p-3 sm:p-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400 shrink-0" />
                                        <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Rostering Saved</span>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-white">{calculatedHoursSaved} hrs</div>
                                    <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1">Estimated /month</div>
                                </div>
                                <div className="rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-800 p-3 sm:p-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                        <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                                        <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Cost Saved</span>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">${calculatedMoneySaved}</div>
                                    <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1">Operating /month</div>
                                </div>
                            </div>

                            <div className="mt-6 sm:mt-8">
                                <Button className="w-full justify-center shadow-lg hover:shadow-indigo-500/20 text-xs sm:text-sm">
                                    Adopt Plan &amp; Setup Tenant
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
          6. TESTIMONIALS CAROUSEL
      ═══════════════════════════════════════════════ */}
            <section id="testimonials" className="py-16 sm:py-20 border-t border-slate-900 bg-slate-950">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4 text-white">
                            Trusted by Leading Academies
                        </h2>
                        <p className="text-sm sm:text-base text-slate-400">
                            Read how driving academy managers automated their manual planning calendars.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <Carousel>
                            {[
                                {
                                    quote: 'Before adopting DSMS, planning weekly rosters for our 18 active driving instructors was a logistical nightmare. Now, calendar schedules are synced, double-bookings are impossible, and students can view lessons directly.',
                                    initials: 'ML', bg: 'bg-indigo-500',
                                    name: 'Markus Laurent', role: 'Director, Apex Academy (Munich)',
                                },
                                {
                                    quote: 'The dynamic billing reconciler changed everything for our accounts. Handling cash and cards, generating custom invoices on checkpoints, and calculating staff commissions used to take days. Now it runs instantly.',
                                    initials: 'SF', bg: 'bg-blue-500',
                                    name: 'Sophia Flores', role: 'Operations Manager, Metro Drive (San Jose)',
                                },
                            ].map(({ quote, initials, bg, name, role }) => (
                                <div key={name} className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 sm:p-8 md:p-10 flex flex-col items-center text-center">
                                    <div className="flex gap-1 mb-5 sm:mb-6">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-indigo-400 text-indigo-400" />
                                        ))}
                                    </div>
                                    <blockquote className="text-sm sm:text-base md:text-lg font-medium text-slate-200 leading-relaxed mb-5 sm:mb-6">
                                        "{quote}"
                                    </blockquote>
                                    <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full ${bg} flex items-center justify-center font-bold text-white text-xs sm:text-sm mb-2.5 sm:mb-3`}>
                                        {initials}
                                    </div>
                                    <cite className="not-italic">
                                        <span className="block font-bold text-white text-xs sm:text-sm">{name}</span>
                                        <span className="block text-[10px] sm:text-xs text-slate-500 mt-0.5">{role}</span>
                                    </cite>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
          7. FAQ ACCORDION
      ═══════════════════════════════════════════════ */}
            <section id="faq" className="py-16 sm:py-20 border-t border-slate-900 bg-slate-900/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4 text-white">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-sm sm:text-base text-slate-400">
                            Clear answers regarding our multitenancy, pricing policies, and onboarding process.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <Accordion type="single" defaultValue="tenant">
                            {[
                                {
                                    value: 'tenant',
                                    q: 'How does multi-tenant resolving work?',
                                    a: 'DSMS isolates active accounts at the database layer. When you sign up, you provide a unique subdomain slug (e.g., metro-drive). Our server parses incoming host headers and dynamically loads configurations specific to your branch, ensuring perfect data isolation and security.',
                                },
                                {
                                    value: 'migration',
                                    q: 'Can we import old student rosters?',
                                    a: 'Yes! We provide robust import mapping pipelines for Excel and CSV logs. Our client support team helps map historical rosters, pending payments, and ongoing student permits into your cloud account at no extra charge.',
                                },
                                {
                                    value: 'pricing',
                                    q: 'Are there any hidden costs per student?',
                                    a: 'No, our billing model is completely transparent and based on simple tiers of active students and instructors. Unlike other SaaS software, we do not charge transaction commissions or hidden per-student registration fees.',
                                },
                                {
                                    value: 'support',
                                    q: 'What customer service channels do you offer?',
                                    a: 'Our Core Growth plan includes standard business-hour email support. Our Professional and Enterprise Cloud tiers include a dedicated Slack channel with 24/7 priority emergency response times.',
                                },
                            ].map(({ value, q, a }) => (
                                <AccordionItem key={value} value={value}>
                                    <AccordionTrigger className="text-sm sm:text-base">{q}</AccordionTrigger>
                                    <AccordionContent className="text-xs sm:text-sm">{a}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
          8. FOOTER
          mobile: 1 col, tablet: 2 col, desktop: 4 col
      ═══════════════════════════════════════════════ */}
            <footer className="border-t border-slate-900 bg-slate-950 py-10 sm:py-14 text-slate-400">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">

                        {/* Logo & pitch — full width on all breakpoints in col-span */}
                        <div className="sm:col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-extrabold text-sm shadow-md">
                                    D
                                </div>
                                <span className="text-base sm:text-lg font-bold text-white tracking-tight">DSMS</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-3 sm:mb-4">
                                Driving School Management System (SaaS) is a secure multi-tenant cloud enterprise platform helping academies scale operations and rosters.
                            </p>
                            <span className="text-xs text-slate-600">© 2026 DSMS Inc. All rights reserved.</span>
                        </div>

                        {/* Product links */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 sm:mb-4">Product</h4>
                            <ul className="space-y-2 text-xs">
                                {[['#features', 'Features'], ['#simulator', 'Simulator'], ['#roi-calculator', 'Pricing & ROI'], ['#', 'Swagger API']].map(([href, label]) => (
                                    <li key={label}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal links */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 sm:mb-4">Legal</h4>
                            <ul className="space-y-2 text-xs">
                                {['Terms of Service', 'Privacy Policy', 'Security Controls', 'SLA Agreement'].map((label) => (
                                    <li key={label}><a href="#" className="hover:text-white transition-colors">{label}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    )
}
