import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase.from('servicios').select('id,nombre')
  
  return NextResponse.json({ 
    servicios: data,
    serviciosCount: data?.length,
    error,
    errorMessage: error?.message,
    errorDetails: error?.details
  })
}
