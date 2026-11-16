import type { ButtonHTMLAttributes, ReactNode } from 'react'

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-[#141519] p-4 ${className}`}>{children}</div>
)

export const Stat = ({ value, label }: { value: ReactNode; label: string }) => (
  <Card>
    <div className="text-3xl font-semibold leading-none">{value}</div>
    <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-gray-400">{label}</div>
  </Card>
)

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'amber' | 'dark' | 'red' }
export const Btn = ({ tone = 'dark', className = '', ...p }: BtnProps) => {
  const t = { amber: 'bg-amber-500 text-black font-semibold', dark: 'bg-[#1C1D22] border border-white/10', red: 'bg-red-400 text-black font-semibold' }[tone]
  return <button {...p} className={`h-8 rounded-full px-4 text-sm ${t} ${className}`} />
}

export const Tag = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] ${ok ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>{children}</span>
)

export const Th = ({ children }: { children: ReactNode }) => (
  <th className="border-b border-white/10 px-2.5 py-2 text-left font-mono text-[11px] font-normal uppercase tracking-wider text-gray-500">{children}</th>
)
export const Td = ({ children, mono }: { children: ReactNode; mono?: boolean }) => (
  <td className={`border-b border-white/10 px-2.5 py-2.5 ${mono ? 'font-mono text-xs text-gray-400' : ''}`}>{children}</td>
)
