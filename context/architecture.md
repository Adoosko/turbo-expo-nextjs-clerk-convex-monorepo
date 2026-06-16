# Architecture Context

## Stack

| Vrstva        | Technológia                         | Rola                                                                       |
| ------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Monorepo      | Turborepo + pnpm workspaces         | Orchestruje buildy a dev úlohy naprieč všetkými packages                  |
| Framework     | Next.js 16 + TypeScript             | Webový dashboard (`apps/web`)                                              |
| Native        | Expo SDK 55 + React Native          | Android/iOS app (`apps/native`)                                            |
| Navigácia     | Expo Router (file-based)            | Routing natívnych obrazoviek                                               |
| UI — Web      | Tailwind CSS + shadcn/ui            | Komponentová knižnica a utility styling pre web                            |
| UI — Native   | NativeWind v4 + vlastné komponenty  | Tailwind-kompatibilný styling pre React Native                             |
| Auth          | Clerk                               | Prihlásenie, session management, identita používateľa                      |
| Backend/DB    | Convex                              | Reaktívna databáza, server funkcie, real-time subscriptions                |
| Offline Store | Expo SQLite (`expo-sqlite`)         | Lokálna write queue pre záznamy zadané bez pripojenia                      |
| Offline Sync  | NetInfo + vlastný sync hook         | Detekuje zmeny pripojenia a vyprázdni SQLite frontu do Convex              |

## Štruktúra monorepa

```
/
├── apps/
│   ├── web/          — Next.js webový dashboard
│   └── native/       — Expo React Native app
└── packages/
    └── backend/      — Convex schema, queries, mutations, actions
```

## Systémové hranice (System Boundaries)

- `apps/web/` — Webové UI, Next.js pages a layouts, server components,
  Clerk middleware. Žiadna offline logika tu nežije.
- `apps/native/` — React Native obrazovky, Expo Router navigácia, NativeWind
  štýly, SQLite offline fronta, NetInfo sync hook.
- `packages/backend/` — Všetky Convex funkcie (queries, mutations). Jediný
  zdroj pravdy pre schému a biznis logiku. Zdieľané oboma appkami cez
  generovaný `api` objekt.

## Modulárna architektúra

Sledovanie je rozdelené do **modulov**. Každý modul je skupina Convex
funkcií + natívna obrazovka + webový widget, ktoré spolu tvoria jeden
sledovací celok (napr. vajcia, zemiaky, jahody).

Modul definuje:
- `moduleId` — unikátny string slug (napr. `"vajcia"`, `"zemiaky"`)
- `label` — slovenský názov zobrazovaný v UI
- `unit` — merná jednotka (`"ks"`, `"kg"`, `"l"`, atď.)
- `icon` — názov ikony z Feather / Lucide setu
- `color` — farba modulu z palety (CSS token)

Moduly sú registrované v `packages/backend/convex/modules.ts`. Pridanie
nového modulu nevyžaduje zmenu existujúcich tabuliek — používa generickú
tabuľku `entries`.

## Storage Model

- **Convex databáza**: Všetky autoritatívne dáta.
  Tabuľky: `modules`, `entries`. (Farmy a členstvá sú riadené cez Clerk Organizations).
- **Expo SQLite (len native)**: Dočasná write queue pre offline záznamy.
  Riadky sa z SQLite vymažú až po potvrdení úspešného syncu do Convex.
  SQLite nikdy neobsahuje dáta, ktoré už existujú v Convex.

## Dátový model (Convex Schema)

```text
modules
  _id, orgId (Clerk organization ID), moduleId (slug), label, unit, icon, color, createdAt
  — buď systémové (seed pri vytvorení farmy) alebo používateľom pridané

entries
  _id, orgId (Clerk organization ID), moduleId (slug), date (YYYY-MM-DD), value (number),
  note? (string), loggedBy (Clerk userId), createdAt, updatedAt
```

**Kľúčový invariant**: Jeden `entry` na `(orgId, moduleId, date)`.
Druhý zápis pre rovnaký deň a modul musí updatovať existujúci riadok,
nie vytvoriť nový.

## Auth a prístupový model

- Každý používateľ sa prihlasuje cez Clerk (email/heslo alebo OAuth).
- Clerk identita sa posiela do Convex cez JWT; Convex ju overuje pomocou `CLERK_JWT_ISSUER_DOMAIN`.
- **Clerk Organizations** plne riadia farmy. Jeden používateľ môže patriť aj k viacerým farmám (organizáciám) a prepínať medzi nimi cez Clerk `<OrganizationSwitcher />`.
- Všetky Convex mutácie overujú, že v JWT tokene je prítomný platný `org_id` a používateľ má do danej organizácie prístup (čo zabezpečuje Clerk).
- Odpadá potreba vlastných pozývacích kódov, všetko ide cez Clerk email invites.

## Invarianty

1. Dáta sú vždy vizuálne a logicky oddelené pomocou `orgId`. 
2. Jeden `entry` na `(orgId, moduleId, date)` — druhý zápis je upsert,
   nie insert. Toto zabraňuje duplikátom pri offline sync reprehratí.
3. Convex backend je jediný zdroj pravdy pre záznamy. SQLite fronta je len transportný
   buffer — obsahuje iba dáta, ktoré ešte nedorazili do Convex.
4. Convex mutácie musia overiť auth (JWT `org_id`) pred akýmkoľvek čítaním alebo zápisom.
5. `moduleId` v tabuľke `entries` musí zodpovedať zaregistrovanému modulu
   v `modules` pre danú farmu (`orgId`). Záznamy pre neexistujúce moduly nesmú vzniknúť.
