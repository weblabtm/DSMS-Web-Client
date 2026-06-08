/**
 * @file AccessDeniedScreen.jsx
 * @layer UI — Pure presentational component. No auth logic lives here.
 *
 * PURPOSE
 * -------
 * Rendered by ProtectedRoute when an authenticated user visits a route they
 * do not have the required role for (e.g. a Student hitting an Instructor route).
 *
 * ╔══════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULE                                  ║
 * ║  You may freely change the visual design of this file.  ║
 * ║  Do NOT add role-check logic here. The decision of      ║
 * ║  "who is denied" lives in ProtectedRoute.jsx.           ║
 * ║  This component only displays the result of that        ║
 * ║  decision — it receives userRoles and dashboardPath      ║
 * ║  as props.                                              ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * @param {object}   props
 * @param {string[]} props.userRoles     Roles the current user actually has (for display)
 * @param {string}   props.dashboardPath The path to redirect the user back to their dashboard
 * @param {Function} props.onLogout      Callback that triggers the auth logout flow
 */

import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'
import { Button } from './button'

export function AccessDeniedScreen({ userRoles = [], dashboardPath = '/', onLogout }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 px-4">
      {/* Ambient glow — purely decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-900/40 p-8 text-center backdrop-blur-xl shadow-2xl shadow-red-950/10">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10 border border-red-500/20">
          <ShieldAlert className="h-7 w-7" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Access Denied
        </h1>

        {/* Explanation — shows the user's actual role(s) */}
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Your account role{' '}
          <span className="font-semibold text-slate-200">({userRoles.join(', ')})</span> does not
          have authorization to view this area. Please contact your system administrator.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild variant="default" className="w-full">
            <Link to={dashboardPath} className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Go to Dashboard
            </Link>
          </Button>

          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full border-red-900/30 text-red-400 hover:bg-red-950/20 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 mr-2 inline" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AccessDeniedScreen
