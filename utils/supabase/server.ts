import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DEFAULT_SUPABASE_URL = 'https://bfyayvnnhjsiggjoikma.supabase.co'
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeWF5dm5uaGpzaWdnam9pa21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTA3NTksImV4cCI6MjEwNDA2Njc1OX0.3Ru3Hw8b_OR6OMUr8HV2E8AGpsHlFrZt8fqRDXz3QmY'

export async function createClient() {
  const cookieStore = await cookies()

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  const url = (envUrl && envUrl.startsWith('http')) ? envUrl : DEFAULT_SUPABASE_URL
  const key = (envKey && envKey.length > 20) ? envKey : DEFAULT_SUPABASE_KEY

  return createServerClient(
    url,
    key,
    {
      global: {
        headers: {
          apikey: key,
        },
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
          }
        },
      },
    }
  )
}