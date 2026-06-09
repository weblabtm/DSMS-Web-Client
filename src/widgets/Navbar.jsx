import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '../shared/ui/button.jsx'
import { buildBaseHostUrl } from '../shared/config/runtime-config.js'

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const handleNavClick = (e, targetId) => {
        if (location.pathname === '/') {
            e.preventDefault()
            const element = document.getElementById(targetId)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
        setMobileMenuOpen(false)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-sm sm:text-base md:text-lg shadow-lg shadow-indigo-500/20 shrink-0">
                        D
                    </div>
                    <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        DSMS<span className="text-indigo-400 font-medium text-[9px] sm:text-[10px] md:text-xs ml-0.5 sm:ml-1 uppercase tracking-wider">SaaS</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-xs sm:text-sm font-semibold text-slate-300">
                    <a href="/#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-white transition-colors py-1">Features</a>
                    <a href="/#simulator" onClick={(e) => handleNavClick(e, 'simulator')} className="hover:text-white transition-colors py-1">Live Walkthrough</a>
                    <a href="/#roi-calculator" onClick={(e) => handleNavClick(e, 'roi-calculator')} className="hover:text-white transition-colors py-1">Pricing &amp; ROI</a>
                    <a href="/#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="hover:text-white transition-colors py-1">Testimonials</a>
                    <a href="/#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors py-1">FAQ</a>
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex lg:hidden items-center gap-2">
                    <Link to={buildBaseHostUrl('/login')} className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 transition-colors">
                        Sign In
                    </Link>
                    <Link to="/dashboard">
                        <Button size="sm">
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
                <div className="hidden lg:flex items-center gap-3 sm:gap-4">
                    <Link to={buildBaseHostUrl('/login')} className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 transition-colors">
                        Sign In
                    </Link>
                    <Link to="/dashboard">
                        <Button size="default" className="text-xs sm:text-sm">
                            Launch App <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-900 transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                </button>
            </div>

            {/* Mobile drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-slate-900 bg-slate-950/98 backdrop-blur-lg px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                    <nav className="flex flex-col gap-3 sm:gap-4 text-sm sm:text-base font-semibold text-slate-300 mb-4 sm:mb-6">
                        {[
                            ['/#features', 'features', 'Features'],
                            ['/#simulator', 'simulator', 'Live Walkthrough'],
                            ['/#roi-calculator', 'roi-calculator', 'Pricing & ROI'],
                            ['/#testimonials', 'testimonials', 'Testimonials'],
                            ['/#faq', 'faq', 'FAQ'],
                        ].map(([href, targetId, label]) => (
                            <a key={href} href={href} onClick={(e) => handleNavClick(e, targetId)} className="hover:text-white py-2 transition-colors">
                                {label}
                            </a>
                        ))}
                    </nav>
                    <div className="h-px bg-slate-900 mb-3 sm:mb-5" />
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <Link to={buildBaseHostUrl('/login')} onClick={() => setMobileMenuOpen(false)} className="text-center font-bold text-slate-300 hover:text-white py-2 sm:py-2.5 transition-colors text-sm sm:text-base">
                            Sign In
                        </Link>
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                            <Button className="w-full justify-center text-sm sm:text-base">Launch App</Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}
