import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const isValidUrl = url.startsWith('http://') || url.startsWith('https://')
  const safeUrl = isValidUrl ? url : 'https://placeholder.supabase.co'
  const safeKey = key || 'placeholder-anon-key'

  return createBrowserClient(safeUrl, safeKey)
}