'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Nem bejelentkezett' }

  const full_name = formData.get('full_name') as string
  const phone = (formData.get('phone') as string) || null

  const shipping_address = JSON.stringify({
    zip_code: formData.get('zip_code') ?? '',
    city: formData.get('city') ?? '',
    address: formData.get('address') ?? '',
    country: formData.get('country') ?? '',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('users')
    .update({
      full_name,
      phone,
      shipping_address,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/account')
  return { success: true }
}
