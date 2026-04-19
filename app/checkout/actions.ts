'use server'

import { createClient } from '@/lib/supabase/server'

export interface CartItemInput {
  productId: string
  quantity: number
  unitPrice: number
  productName: string
}

export interface ShippingFormValues {
  full_name: string
  email: string
  phone: string
  zip_code: string
  city: string
  address: string
  country: string
  notes?: string
}

export async function placeOrder(
  shippingData: ShippingFormValues,
  cartItems: CartItemInput[]
): Promise<{ orderId: string }> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Nem vagy bejelentkezve.')
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_amount: totalAmount,
      shipping_name: shippingData.full_name,
      shipping_address: shippingData.address,
      shipping_city: shippingData.city,
      shipping_zip: shippingData.zip_code,
      shipping_country: shippingData.country,
      notes: shippingData.notes ?? null,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    throw new Error('Rendelés létrehozása sikertelen.')
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    product_name: item.productName,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    throw new Error('Rendelési tételek mentése sikertelen.')
  }

  for (const item of cartItems) {
    const { error: rpcError } = await supabase.rpc('decrement_stock', {
      product_id: item.productId,
      qty: item.quantity,
    })
    if (rpcError) {
      throw new Error(`Készlet csökkentése sikertelen: ${item.productName}`)
    }
  }

  // Send confirmation email — failure must never fail the order
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'FurnSpace <noreply@furnspace.hu>',
      to: user.email!,
      subject: `Rendelés visszaigazolás – #${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <h1>Köszönjük a rendelését!</h1>
        <p>Rendelés azonosítója: <strong>${order.id}</strong></p>
        <p>Végösszeg: <strong>${totalAmount.toLocaleString('hu-HU')} Ft</strong></p>
        <p>Hamarosan feldolgozzuk a rendelését.</p>
      `,
    })
  } catch (emailError) {
    // Email sending failure must NOT fail the order
    console.error('Email küldési hiba:', emailError)
  }

  return { orderId: order.id }
}
