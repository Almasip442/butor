'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role: string } | null)?.role !== 'admin') redirect('/')
}

export async function createCategory(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  const payload = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
  }

  const { error } = await adminClient
    .from('categories')
    .insert(payload)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  const payload = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
  }

  const { error } = await adminClient
    .from('categories')
    .update(payload)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  const { count } = await adminClient
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: 'Nem törölhető: vannak termékek ebben a kategóriában',
    }
  }

  const { error } = await adminClient
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}
