import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type AdminStatus = 'loading' | 'out' | 'denied' | 'admin'

// UX gate only. Real protection is the RLS policies (is_admin()) in the database.
export function useAdmin() {
  const [status, setStatus] = useState<AdminStatus>('loading')

  const check = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setStatus('out')
    const { data } = await supabase
      .from('profiles').select('role, disabled').eq('id', session.user.id).single()
    setStatus(data?.role === 'admin' && !data?.disabled ? 'admin' : 'denied')
  }, [])

  useEffect(() => {
    check()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setTimeout(check, 0) // never await supabase calls inside this callback
    })
    return () => subscription.unsubscribe()
  }, [check])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    await check()
    return null
  }
  const signOut = async () => { await supabase.auth.signOut(); setStatus('out') }

  return { status, signIn, signOut }
}
