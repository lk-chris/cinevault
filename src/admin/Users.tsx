import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Tag, Td, Th } from './ui'

type Profile = { id: string; email: string; role: 'user' | 'admin'; disabled: boolean; created_at: string }

export default function Users() {
  const [rows, setRows] = useState<Profile[]>([])
  const [me, setMe] = useState('')
  const load = () => supabase.from('profiles').select('*').order('created_at', { ascending: false })
    .then(({ data }) => setRows((data as Profile[]) ?? []))
  useEffect(() => {
    load()
    supabase.auth.getSession().then(({ data }) => setMe(data.session?.user.id ?? ''))
  }, [])

  const patch = async (id: string, v: Partial<Profile>) => { await supabase.from('profiles').update(v).eq('id', id); load() }

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
