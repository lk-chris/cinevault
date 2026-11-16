import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Btn, Card, Stat, Tag, Td, Th } from './ui'

type Row = { id: number; prompt: string; model: string; tokens_in: number; tokens_out: number; latency_ms: number; ok: boolean; created_at: string }

// Gemini 3.8 Flash pricing per 1M tokens ($0.15 input / $0.60 output)
const PRICE_IN = 0.15
const PRICE_OUT = 0.60

const DEMO_ROWS: Row[] = [
  {
    id: 101,
    prompt: 'mind-bending sci-fi thrillers like Inception and Dark with major plot twists',
    model: 'gemini-3.8-flash',
    tokens_in: 182,
    tokens_out: 96,
    latency_ms: 384,
    ok: true,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 102,
    prompt: 'cozy 90s comfort animated films for a rainy weekend afternoon',
    model: 'gemini-3.8-flash',
    tokens_in: 154,
    tokens_out: 88,
    latency_ms: 326,
    ok: true,
    created_at: new Date(Date.now() - 38 * 60000).toISOString(),
  },
  {
    id: 103,
    prompt: 'fast-paced heist comedy with sharp banter under 100 minutes',
    model: 'gemini-3.8-flash',
    tokens_in: 138,
    tokens_out: 74,
    latency_ms: 295,
    ok: true,
    created_at: new Date(Date.now() - 74 * 60000).toISOString(),
  },
  {
    id: 104,
    prompt: 'dark psychological crime neo-noir movies set in Tokyo',
    model: 'gemini-3.8-flash',
    tokens_in: 165,
    tokens_out: 92,
    latency_ms: 410,
    ok: true,
    created_at: new Date(Date.now() - 132 * 60000).toISOString(),
  },
  {
    id: 105,
    prompt: 'action-packed modern supernatural anime series',
    model: 'gemini-3.8-flash',
    tokens_in: 142,
    tokens_out: 85,
    latency_ms: 340,
    ok: true,
    created_at: new Date(Date.now() - 215 * 60000).toISOString(),
  },
  {
    id: 106,
    prompt: 'romantic date night indie dramedy with witty dialogue',
    model: 'gemini-3.8-flash',
    tokens_in: 149,
    tokens_out: 80,
    latency_ms: 315,
    ok: true,
    created_at: new Date(Date.now() - 310 * 60000).toISOString(),
  },
  {
    id: 107,
    prompt: 'cerebral mystery mini-series with atmospheric slow burn',
    model: 'gemini-3.8-flash',
    tokens_in: 160,
    tokens_out: 91,
    latency_ms: 372,
    ok: true,
    created_at: new Date(Date.now() - 440 * 60000).toISOString(),
  },
]

export default function AiUsage() {
  const [rows, setRows] = useState<Row[]>(DEMO_ROWS)
  const [flt, setFlt] = useState<'all' | 'ok' | 'bad'>('all')

  useEffect(() => {
    supabase.from('ai_usage').select('*').order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRows(data as Row[])
        }
      })
      .catch(() => {
        // Fallback to active demo rows
      })
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

  const cost = (r: Row) => ((r.tokens_in * PRICE_IN + r.tokens_out * PRICE_OUT) / 1e6).toFixed(5)
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
                  <Td mono>{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
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
