import { createBrowserClient } from '@supabase/ssr'

const DEFAULT_SUPABASE_URL = 'https://bfyayvnnhjsiggjoikma.supabase.co'
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeWF5dm5uaGpzaWdnam9pa21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTA3NTksImV4cCI6MjEwNDA2Njc1OX0.3Ru3Hw8b_OR6OMUr8HV2E8AGpsHlFrZt8fqRDXz3QmY'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (clientInstance) {
    return clientInstance
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  const url = (envUrl && envUrl.startsWith('http')) ? envUrl : DEFAULT_SUPABASE_URL
  const key = (envKey && envKey.length > 20) ? envKey : DEFAULT_SUPABASE_KEY

  clientInstance = createBrowserClient(url, key, {
    global: {
      headers: {
        apikey: key,
      },
    },
  })

  return clientInstance
}