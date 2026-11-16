import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Stat } from './ui'

export default function Overview() {
  const [s, setS] = useState({ users: 0, today: 0, pending: 0 })
  const [days, setDays] = useState<number[]>(Array(14).fill(0))

  useEffect(() => {
    (async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0)
      const since = new Date(start.getTime() - 13 * 864e5).toISOString()
      const [u, p, a] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ai_usage').select('created_at').gte('created_at', since).limit(5000),
      ])
      const b = Array(14).fill(0)
      a.data?.forEach(r => {
        const i = Math.floor((new Date(r.created_at).getTime() - start.getTime()) / 864e5) + 13
        if (i >= 0 && i < 14) b[i]++
      })
      setDays(b); setS({ users: u.count ?? 0, today: b[13], pending: p.count ?? 0 })
    })()
  }, [])

  const max = Math.max(1, ...days)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
        <Stat value={s.users} label="Users" />
        <Stat value={s.today} label="AI requests today" />
        <Stat value={s.pending} label="Reviews to check" />
      </div>
      <Card>
        <h3 className="mb-3 text-[15px] font-semibold">AI requests, last 14 days</h3>
        <div className="flex h-36 items-end gap-1.5">
          {days.map((v, i) => (
            <div key={i} title={`${v} requests`} style={{ height: `${(v / max) * 100}%` }}
              className={`min-h-1 flex-1 rounded-t-md ${i === 13 ? 'bg-amber-500' : 'bg-[#2A2B32]'}`} />
          ))}
        </div>
      </Card>
    </div>
  )
}
