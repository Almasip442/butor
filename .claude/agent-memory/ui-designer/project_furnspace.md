---
name: FurnSpace project UI coverage
description: Admin UI components that exist in code as mock-wired screens, Paper design coverage status for Iteration 4 items
type: project
---

The FurnSpace webshop project (Next.js + Supabase) has completed Iterations 1-3. All UI screens were built with mock data in Milestone 1. Iteration 4 wires existing UI to real backend.

No Paper design tool is in use on this project. The project uses code-first design: components are built directly in the codebase without a separate design file system. The backlog.md and docs/ folder are the design source of truth for this project.

Key admin screens already built (mock-wired):
- components/admin/ProductsDataTable.tsx — table with Switch (active toggle), DropdownMenu (edit/delete), but delete has no confirmation dialog
- app/admin/categories/page.tsx — full CRUD UI with Dialog for create, DropdownMenu for edit/delete, but delete has no confirmation dialog
- app/admin/orders/[id]/page.tsx — order detail with status Badge and a "Státusz módosítása" Button that is not yet wired to a dropdown selector

ProfileForm (components/account/ProfileForm.tsx) — complete form with react-hook-form + zod, submit handler uses setTimeout simulation, not a real Server Action.

**Why:** Iteration 4 is a backend wiring iteration — UI was pre-built in Milestone 1. There is no Paper design system on this project; the existing codebase is the design source of truth.

**How to apply:** When evaluating Iteration 4 tasks, treat existing components as the confirmed UI source. Flag only genuinely missing UI elements (e.g., delete confirmation dialogs, status dropdown) as needing design decisions, not full Paper designs.
