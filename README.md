
# Webfejlesztési keretrendszerek — Projektmunka

> **Hallgató neve:** Almási Péter  
> **Neptun kód:** BC0GZD  
> **Projekt téma:** FurnSpace – Modern Bútor Webshop  
> **Keretrendszer:** Next.js (App Router) + Supabase + shadcn/ui

---

## 🚀 A projekt indítása (lokális futtatás)

```bash
git clone <repo-url>
cd butor
npm install
npm run dev
```

---

## 🌐 Publikus URL

> _[Ide kerül a deployolt alkalmazás URL-je, pl. https://furnspace.vercel.app]_

---

## 📁 Projekt struktúra

```
├── docs/                    # Dokumentáció
│   ├── SPECIFICATION.md     # Funkcionális és nem-funkcionális követelmények
│   ├── DATAMODEL.md         # Adatmodell (entitások, kapcsolatok)
│   ├── COMPONENTS.md        # Komponens-terv
│   └── AI_PROMPT_LOG.md     # AI prompt napló
├── butor/                     # Forráskód
└── .github/workflows/       # Automatikus értékelés (ne módosítsd!)
```

---

## 📅 Mérföldkövek

| # | Tartalom | Határidő | Állapot |
|---|----------|----------|---------| 
| 1 | Specifikáció, UI és megjelenés | 2026.03.29. 23:59 | ⬜ |
| 2 | Backend és adatok | 2026.04.26. 23:59 | ⬜ |
| 3 | Biztonság és tesztelés | 2026.05.10. 23:59 | ⬜ |

### Hogyan kérd az értékelést?

1. Commitold és push-old a munkádat a `main` vagy `master` branch-re
2. Menj a repód **Actions** fülére
3. Válaszd a **"Mérföldkő értékelés"** workflow-t
4. Kattints a **"Run workflow"** → válaszd ki a mérföldkövet → **"Run workflow"**
5. Az eredmény egy **GitHub Issue**-ban jelenik meg

> ⚠️ Mérföldkőnként **maximum 2 alkalommal** futtathatod az értékelést. Használd bölcsen!  
> ⚠️ A határidőkön automatikus értékelés is fut.

---

## ⚠️ Fontos

- A `.github/workflows/` könyvtár tartalmát **ne módosítsd**!
- A `docs/` mappába rakd a dokumentációs fájlokat.
- Az `AI_PROMPT_LOG.md` fájlt a `docs/` mappában vezesd.