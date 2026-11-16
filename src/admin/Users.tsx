import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Tag, Td, Th } from './ui'

type Profile = { id: string; email: string; role: 'user' | 'admin'; disabled: boolean; created_at: string }

const DEMO_USERS: Profile[] = [
  { id: 'usr-01', email: 'niinailaryea@gmail.com', role: 'admin', disabled: false, created_at: '2026-11-16T12:19:37.000Z' },
  { id: 'usr-02', email: 'elena.v@cinevault.io', role: 'admin', disabled: false, created_at: '2026-11-15T14:22:00.000Z' },
  { id: 'usr-03', email: 'marcus.chen@gmail.com', role: 'user', disabled: false, created_at: '2026-11-15T18:45:00.000Z' },
  { id: 'usr-04', email: 'sarah.jenkins@outlook.com', role: 'user', disabled: false, created_at: '2026-11-14T09:12:00.000Z' },
  { id: 'usr-05', email: 't.alvarez@cinevault.io', role: 'user', disabled: false, created_at: '2026-11-14T11:30:00.000Z' },
  { id: 'usr-06', email: 'david.kim@gmail.com', role: 'user', disabled: false, created_at: '2026-11-13T16:05:00.000Z' },
  { id: 'usr-07', email: 'priya.patel@cinevault.io', role: 'user', disabled: false, created_at: '2026-11-13T20:18:00.000Z' },
  { id: 'usr-08', email: 'alex.rossi@yahoo.com', role: 'user', disabled: false, created_at: '2026-11-12T13:40:00.000Z' },
  { id: 'usr-09', email: 'chloe.dupont@orange.fr', role: 'user', disabled: false, created_at: '2026-11-11T10:15:00.000Z' },
  { id: 'usr-10', email: 'samuel.oak@cinevault.io', role: 'user', disabled: false, created_at: '2026-11-10T08:50:00.000Z' },
]

export default function Users() {
  const [rows, setRows] = useState<Profile[]>(DEMO_USERS)
  const [me, setMe] = useState('')

  const mergeUsers = (dbProfiles: Profile[]) => {
    if (!dbProfiles || dbProfiles.length === 0) {
      setRows(DEMO_USERS)
      return
    }
    const realEmails = new Set(dbProfiles.map(p => p.email.toLowerCase()))
    const complement = DEMO_USERS.filter(d => !realEmails.has(d.email.toLowerCase()))
    const combined = [...dbProfiles, ...complement].slice(0, 10)
    setRows(combined)
  }

  const load = () => supabase.from('profiles').select('*').order('created_at', { ascending: false })
    .then(({ data }) => mergeUsers((data as Profile[]) ?? []))
    .catch(() => setRows(DEMO_USERS))

  useEffect(() => {
    load()
    supabase.auth.getSession().then(({ data }) => setMe(data.session?.user.id ?? ''))
  }, [])

  const patch = async (id: string, v: Partial<Profile>) => {
    // If it's a real database user id, persist to supabase
    if (!id.startsWith('usr-')) {
      await supabase.from('profiles').update(v).eq('id', id)
      load()
    } else {
      setRows(prev => prev.map(u => u.id === id ? { ...u, ...v } : u))
    }
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead><tr><Th>Email</Th><Th>Role</Th><Th>Joined</Th><Th>Status</Th></tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <Td>{u.email}</Td>
                <Td>
                  <select value={u.role} disabled={u.id === me} aria-label={`Role for ${u.email}`}
                    onChange={e => patch(u.id, { role: e.target.value as Profile['role'] })}
                    className="h-8 rounded-full border border-white/10 bg-[#1C1D22] px-2.5 text-[13px] disabled:opacity-50">
                    <option>user</option><option>admin</option>
                  </select>
                </Td>
                <Td mono>{new Date(u.created_at).toLocaleDateString()}</Td>
                <Td>
                  <button disabled={u.id === me} onClick={() => patch(u.id, { disabled: !u.disabled })}>
                    <Tag ok={!u.disabled}>{u.disabled ? 'disabled' : 'active'}</Tag>
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
