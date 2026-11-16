import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Btn, Card, Stat, Tag, Td, Th } from './ui'

type Row = { id: number; prompt: string; model: string; tokens_in: number; tokens_out: number; latency_ms: number; ok: boolean; created_at: string }

// TODO: set from your model's pricing page (USD per million tokens). 0 hides the cost column.
const PRICE_IN = 0
const PRICE_OUT = 0

export default function AiUsage() {
  const [rows, setRows] = useState<Row[]>([])
  const [flt, setFlt] = useState<'all' | 'ok' | 'bad'>('all')

  useEffect(() => {
    supabase.from('ai_usage').select('*').order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => setRows((data as Row[]) ?? []))
  }, [])

  const st = useMemo(() => {
    const week = rows.filter(r => Date.now() - new Date(r.created_at).getTime() < 7 * 864e5)
    const n = rows.length || 1
    return {
      week: week.length,
      tin: rows.reduce((a, r) => a + r.tokens_in, 0),
      tout: rows.reduce((a, r) => a + r.tokens_out, 0),
      ms: Math.round(rows.reduce((a, r) => a + r.latency_ms, 0) / n),
      fail: Math.round((rows.filter(r => !r.ok).length / n) * 100),
    }
  }, [rows])

  const cost = (r: Row) => ((r.tokens_in * PRICE_IN + r.tokens_out * PRICE_OUT) / 1e6).toFixed(4)
  const list = rows.filter(r => flt === 'all' || (flt === 'ok') === r.ok).slice(0, 25)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
        <Stat value={st.week} label="Requests, 7 days" />
        <Stat value={`${(st.tin / 1000).toFixed(1)}k`} label="Tokens in" />
        <Stat value={`${(st.tout / 1000).toFixed(1)}k`} label="Tokens out" />
        <Stat value={`${st.ms}ms`} label="Avg latency" />
        <Stat value={`${st.fail}%`} label="Failures" />
      </div>
      <Card>
        <div className="mb-3 flex gap-2">
          {(['all', 'ok', 'bad'] as const).map(f => (
            <Btn key={f} tone={flt === f ? 'amber' : 'dark'} onClick={() => setFlt(f)}>
              {f === 'all' ? 'All' : f === 'ok' ? 'Success' : 'Failed'}
            </Btn>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead><tr><Th>When</Th><Th>Prompt</Th><Th>Model</Th><Th>Tokens</Th><Th>Latency</Th>{PRICE_IN + PRICE_OUT > 0 && <Th>Cost</Th>}<Th>Status</Th></tr></thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id}>
                  <Td mono>{new Date(r.created_at).toLocaleString()}</Td>
                  <Td>{r.prompt}</Td><Td mono>{r.model}</Td>
                  <Td mono>{r.tokens_in} / {r.tokens_out}</Td><Td mono>{r.latency_ms}ms</Td>
                  {PRICE_IN + PRICE_OUT > 0 && <Td mono>${cost(r)}</Td>}
                  <Td><Tag ok={r.ok}>{r.ok ? 'ok' : 'failed'}</Tag></Td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <p className="p-6 text-center text-sm text-gray-400">No calls logged yet.</p>}
        </div>
      </Card>
    </div>
  )
}
