# Code Standards

## Všeobecné (General)

- Moduly sú malé a jednoznačné. Súbor, ktorý robí dve nesúvisiace veci, sa
  rozdelí na dva súbory.
- Opravuj príčiny, nie symptómy. Ak offline sync nefunguje, oprav sync logiku
  — nepridávaj retry tlačidlo ako záplatu.
- Nemiešaj nesúvisiace záujmy v jednom komponente (napr. auth logika a UI
  rendering v jednom súbore).
- Explicitné nad chytrým. Čitateľnosť je dôležitejšia ako stručnosť.

## Jazyk UI (UI Language)

- Všetky reťazce zobrazované používateľovi sú v **slovenčine**.
- Kód, komentáre, názvy premenných, Convex funkcie a Git správy zostávajú
  v **angličtine**.
- Žiadne hardcoded anglické reťazce v JSX. Použiť konštanty alebo budúci
  i18n systém.

## Tailwind CSS

- **Tailwind je jediný styling systém** na webe aj na natívnej appke.
  Žiadny Bootstrap, žiadne CSS knižnice tretích strán pre stylovanie.
- Na webe: štandardný Tailwind CSS v3+ s konfiguráciou v
  `apps/web/tailwind.config.ts`.
- Na natívnej appke: NativeWind v4, konfigurovaný v
  `apps/native/tailwind.config.ts`.
- Žiadne hardcoded hex hodnoty. Všetky farby sa referencujú cez CSS custom
  property tokeny definované v `ui-context.md` a rozšírené v
  `tailwind.config` ako `extend.colors`.
- Žiadne `StyleSheet.create` objekty okrem hodnôt, ktoré NativeWind nedokáže
  vyjadriť (napr. absolútne transformácie).

## TypeScript

- Strict mode je povinný vo všetkých packages (`strict: true` v každom
  `tsconfig.json`).
- Nepoužívaj `any`. Používaj explicitné interfaces alebo `unknown` s type
  guardom na hranici.
- Validuj a zužuj neznámy externý vstup (pozývacie kódy, dátumy od
  používateľa, hodnoty záznamov) pred odovzdaním do biznis logiky.
- Zdieľaj typy cez generované Convex API (`packages/backend/_generated/`) —
  neprepisuj schema typy manuálne v app kóde.

## Next.js (Webová appka)

- Predvolene React Server Components. Pridaj `"use client"` len keď je
  potrebná browserová interaktivita (hooks, event handlers).
- Route handlery v `app/api/` musia mať jednu zodpovednosť.
- Fonty načítavaj cez `next/font/google` — žiadne externé `<link>` tagy.
- Auth sa vynucuje cez Clerk middleware; neduplicuj auth checky v
  jednotlivých page komponentoch.

## React Native / Expo

- Všetky obrazovky žijú pod `apps/native/app/` podľa Expo Router konvencií.
- Štylizuj výhradne cez NativeWind triedy. Žiadne `StyleSheet.create`
  objekty okrem vymenovaných výnimiek.
- Platform-specific kód ide do `.native.ts` / `.web.ts` súborov — nepoužívaj
  `Platform.OS` vetvenie v shared logike.
- Nevolaj Convex mutácie priamo z komponentov. Smeruj mutácie cez vlastné
  hooky (napr. `useLogEntry`), aby bola offline queuing logika centralizovaná.

## Modulárny systém

- Každý tracking modul (vajcia, zemiaky, jahody...) je registrovaný v
  `packages/backend/convex/modules.ts` ako konštanta s `moduleId`, `label`,
  `unit`, `icon`, `color`.
- Generická tabuľka `entries` sa používa pre všetky moduly. Nová plodina
  alebo zviera = nová registrácia modulu, nie nová Convex tabuľka.
- UI komponenty (karta modulu, log modal) sú generické a riadia sa konfiguráciou
  modulu — netvoria sa osobitné komponenty pre každý modul.

## Offline / Sync

- Všetky offline záznamy sa zapisujú do SQLite tabuľky `offline_queue`
  cez hook `useOfflineQueue` pred akýmkoľvek pokusom o sieť.
- Sync hook (`useSyncQueue`) vyprázdňuje frontu v poradí vkladania. Musí
  zvládnuť duplikáty pomocou `(farmId, moduleId, date)` upsert invariantu
  z `architecture.md`.
- Nikdy nevymaz riadok z fronty, kým Convex mutácia nepotvrdí úspech.
- Zmeny stavu NetInfo sú jediný spúšťač sync pokusov — nepoužívaj polling
  na intervale.

## Convex funkcie (`packages/backend/`)

- Každá mutácia musí overiť, že `ctx.auth.getUserIdentity()` vracia
  nenulový identity pred akoukoľvek prácou.
- Každá mutácia dotýkajúca sa dát farmy musí overiť členstvo volajúceho
  používateľa vo farme cez `farmMembers` lookup pred zápisom.
- Queries vystavujúce dáta farmy musia aplikovať rovnaký členský check.
- Vracia konzistentné, predvídateľné tvary — nikdy nevraciaj `null` kde
  prázdne pole alebo typovaný error objekt je popisnejší.
- Používaj Convex argument validators (`v.string()`, `v.number()`, atď.)
  na každej funkcii — neakceptuj nevalidované argumenty.

## Dáta a úložisko

- Autoritatívne dáta patria do Convex. SQLite je len transportný buffer.
- Nikdy neukladaj Clerk session tokeny, JWTs ani tajné kľúče do SQLite
  alebo AsyncStorage.
- Hodnoty záznamov (`entry.value`) sú nezáporné čísla. Validuj `value >= 0`
  na úrovni Convex mutácie, nie len v UI.
- Dátumy sú uložené ako ISO 8601 date stringy (`YYYY-MM-DD`) v Convex.
  Používa sa lokálny dátum zariadenia; žiadna timezone konverzia v v1.

## Organizácia súborov (File Organisation)

```
apps/web/src/
  app/               — Next.js App Router pages a layouts
  components/ui/     — shadcn/ui generované komponenty (neupravovať manuálne)
  components/        — App-specific zložené komponenty
  hooks/             — Client-side hooky
  lib/               — Utility funkcie (formátovanie dátumov, moduly registry)

apps/native/
  app/               — Expo Router obrazovky
  components/ui/     — Zdieľané primitívne UI komponenty (Button, Card, Badge)
  components/        — Zložené komponenty na úrovni obrazoviek
  hooks/             — useOfflineQueue, useSyncQueue, useLogEntry, atď.
  lib/               — SQLite client setup, NetInfo helpers, modules registry

packages/backend/
  convex/            — Schema, queries, mutations (zdroj pravdy)
  convex/modules.ts  — Registrácia všetkých tracking modulov
  convex/_generated/ — Auto-generované typy (neupravovať)
```
