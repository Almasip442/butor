---
name: Iteráció 4 — Admin CRUD és Storage
description: Iteráció 4 implementáció befejezve: admin CRUD, Supabase Storage képfeltöltés, kategóriák CRUD, rendelés státusz, profil szerkesztés
type: project
---

Iteráció 4 implementáció befejezve 2026-04-17.

**Why:** Admin felület valódi adatbázis-műveletekkel (Supabase), MOCK adatok eltávolítva.

**How to apply:** Minden admin Server Action `requireAdmin()` ellenőrzést tartalmaz. Az adminClient `as any` cast-tel használandó DML műveleteknél a database.types.ts és a supabase-js v2.99.2 típusinkompatibilitás miatt.

**Kulcstechnikai döntés:** A `createAdminClient() as any` cast szükséges, mert a `database.types.ts` PostgrestVersion "12" formátuma nem kompatibilis a supabase-js v2.99.2 típusrendszerével update/insert/delete esetén. Select esetén a cast nem szükséges.

**Létrehozott fájlok:**
- `app/admin/products/actions.ts` — upsertProduct, deleteProduct, uploadProductImage
- `app/admin/orders/actions.ts` — updateOrderStatus
- `app/admin/categories/actions.ts` — createCategory, updateCategory, deleteCategory
- `app/account/actions.ts` — updateProfile
- `components/admin/CategoriesClient.tsx` — teljes kategória dialóg logika
- `components/admin/OrdersDataTable.tsx` — rendelések tábla státuszváltóval
- `components/admin/OrderStatusSelect.tsx` — rendelés detail státuszváltó Select
- `components/ui/alert-dialog.tsx` — AlertDialog UI komponens (radix-ui alapú)
