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

export async function upsertProduct(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  await requireAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  const id = formData.get('id') as string | null
  const imagesRaw = formData.get('images') as string | null

  let images: string[] = []
  try {
    images = imagesRaw ? JSON.parse(imagesRaw) : []
  } catch {
    images = []
  }

  const payload = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string,
    price: Number(formData.get('price')),
    stock_quantity: Number(formData.get('stock_quantity')),
    category_id: formData.get('category_id') as string,
    is_active: formData.get('is_active') === 'true',
    is_featured: formData.get('is_featured') === 'true',
    images,
    updated_at: new Date().toISOString(),
  }

  let error: { message: string } | null = null

  if (id) {
    const result = await adminClient
      .from('products')
      .update(payload)
      .eq('id', id)
    error = result.error
  } else {
    const result = await adminClient
      .from('products')
      .insert(payload)
    error = result.error
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
  redirect('/admin/products')
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  const { error } = await adminClient
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
  return { success: true }
}

export async function uploadProductImage(
  formData: FormData
): Promise<{ url: string }> {
  await requireAdmin()

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('Nincs fájl')
  if (file.size > 5 * 1024 * 1024) throw new Error('Max 5 MB')

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any
  const { error } = await adminClient.storage
    .from('product-images')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(error.message)

  const { data } = adminClient.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return { url: data.publicUrl }
}
