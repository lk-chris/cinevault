import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Btn, Card } from './ui'

type Review = { id: number; title: string; rating: number; body: string; created_at: string }

export default function Reviews() {
  const [rows, setRows] = useState<Review[]>([])
  const load = () => supabase.from('reviews').select('*').eq('status', 'pending').order('created_at')
    .then(({ data }) => setRows((data as Review[]) ?? []))
  useEffect(() => { load() }, [])

  const approve = async (id: number) => { await supabase.from('reviews').update({ status: 'approved' }).eq('id', id); load() }
  const remove = async (id: number) => { await supabase.from('reviews').delete().eq('id', id); load() }

  return (
    <Card>
      {rows.length === 0 && <p className="p-6 text-center text-sm text-gray-400">Queue is clear.</p>}
      {rows.map(r => (
        <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 border-t border-white/10 py-3.5 first:border-0">
          <div>
            <b>{r.title}</b> <span className="font-mono text-xs text-gray-400">{r.rating}/5</span>
            <p className="mt-1.5 max-w-xl text-sm text-gray-300">{r.body}</p>
          </div>
          <div className="flex gap-2">
            <Btn onClick={() => approve(r.id)}>Approve</Btn>
            <Btn tone="red" onClick={() => remove(r.id)}>Delete</Btn>
          </div>
        </div>
      ))}
    </Card>
  )
}
