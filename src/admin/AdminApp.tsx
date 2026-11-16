import { FormEvent, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAdmin } from './useAdmin'
import { Btn } from './ui'
import Overview from './Overview'
import AiUsage from './AiUsage'
import Reviews from './Reviews'
import Users from './Users'

const TABS = [['overview', 'Overview'], ['ai', 'AI usage'], ['reviews', 'Reviews'], ['users', 'Users']] as const
type Tab = typeof TABS[number][0]

const Logo = () => <div className="text-xl font-light tracking-tight">Cine<b className="font-bold text-amber-500">Vault</b><span className="ml-2 font-mono text-[11px] text-gray-400">admin</span></div>
const input = 'mt-1.5 block h-11 w-full rounded-full border border-white/10 bg-[#0A0A0C] px-4 text-[15px] text-white focus:outline-none focus:border-amber-500/50'

export default function AdminApp() {
  const { status, signIn, signOut } = useAdmin()
  const [tab, setTab] = useState<Tab>('overview')
  const [err, setErr] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setErr((await signIn(String(f.get('email')), String(f.get('password')))) ?? '')
  }

  if (status === 'loading') return <div className="min-h-screen bg-[#0A0A0C]" />

  if (status === 'out' || status === 'denied') return (
    <div className="grid min-h-screen place-items-center bg-[#0A0A0C] p-5 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#141519] p-7">
        <Logo />
        <h1 className="mb-1 mt-5 text-2xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mb-5 text-sm text-gray-400">Only accounts with the admin role can enter.</p>
        <label className="mb-3 block text-[13px] text-gray-400">
          Email
          <input name="email" type="email" required autoComplete="username" className={input} />
        </label>
        <div className="mb-3">
          <label className="block text-[13px] text-gray-400">Password</label>
          <div className="relative mt-1.5 flex items-center">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              className={`${input} mt-0 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <p role="alert" className="mb-2 min-h-5 text-[13px] text-red-400">{status === 'denied' ? 'This account isn’t an admin.' : err}</p>
        <button className="h-11 w-full rounded-full bg-amber-500 font-bold text-black transition-opacity hover:opacity-90">Sign in</button>
        {status === 'denied' && <button type="button" onClick={signOut} className="mt-3 w-full text-sm text-gray-400 underline">Use a different account</button>}
      </form>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <header className="flex flex-wrap items-center justify-between gap-3 py-4">
          <Logo /><Btn onClick={signOut}>Sign out</Btn>
        </header>
        <nav className="mb-4 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#141519] p-1">
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${tab === k ? 'bg-amber-500 font-semibold text-black' : 'text-gray-400'}`}>{l}</button>
          ))}
        </nav>
        {tab === 'overview' && <Overview />}
        {tab === 'ai' && <AiUsage />}
        {tab === 'reviews' && <Reviews />}
        {tab === 'users' && <Users />}
      </div>
    </div>
  )
}
