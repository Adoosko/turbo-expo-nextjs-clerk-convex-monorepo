# AI Workflow Rules

## Prístup (Approach)

Finik Farma sa buduje inkrementálne pomocou spec-driven workflowu. Šesť
context súborov definuje čo, ako a v akom stave je projekt. Vždy
implementuj podľa týchto specs — nevymýšľaj správanie, ktoré tu nie je
definované. Ak si nie si istý, pridaj Open Question do `progress-tracker.md`
namiesto hádania.

## Pravidlá rozsahu (Scoping Rules)

- Pracuj na jednej feature jednotke naraz (zoznam jednotiek v
  `progress-tracker.md`).
- Preferuj malé, overiteľné prírastky pred veľkými špekulatívnymi zmenami.
- Nekombinuj nesúvisiace systémové hranice v jednom implementačnom kroku.
- Jednotka je hotová len vtedy, keď funguje end-to-end v rámci svojho
  definovaného rozsahu.

## Kedy rozdeliť prácu (When to Split Work)

Rozdeľ implementačný krok ak kombinuje:

- Zmeny natívneho UI **a** Convex backend zmeny (rozdeľ na 2 kroky).
- Offline queue logiku **a** novú obrazovku (queue je infraštruktúra,
  obrazovka je feature — sú to 2 kroky).
- Dve nesúvisiace Convex tabuľky alebo mutácie.
- Akúkoľvek zmenu, ktorej end-to-end overenie vyžaduje viac ako jeden
  odlišný testovací scenár.

Ak zmenu nemožno rýchlo overiť end-to-end, rozsah je príliš veľký — rozdeľ ho.

## Poradie implementácie — Fáza 1 (MVP)

Odporúčané poradie. Nekroč kroky; každý závisí od predchádzajúceho.

1. **Repo bootstrap** — Klonovanie Convex monorepo šablóny, konfigurácia
   Clerk a Convex env vars, overenie, že `npm run dev` spustí všetky 3 packages.
2. **Convex schema** — Definovanie `farms`, `farmMembers`, `modules`,
   `entries`, `inviteCodes` v `packages/backend/convex/schema.ts`.
   Registrácia prvého modulu `vajcia` v `convex/modules.ts`.
3. **Farm creation mutation + web UI** — Mutácia `createFarm` + minimálna
   web stránka na vytvorenie farmy po prihlásení.
4. **Systém pozývacích kódov** — Mutácie `createInviteCode` a
   `joinFarmByCode`; web UI na generovanie a zobrazenie kódu; natívna
   obrazovka na zadanie kódu.
5. **Natívna hlavná obrazovka** — Hero karta farmy, dnešný počet vajec
   (statický placeholder), karta modulu Vajcia.
6. **Entry mutácia** — `upsertEntry` Convex mutácia s `(farmId, moduleId,
   date)` uniqueness constraintom.
7. **Log flow (native)** — Bottom-sheet formulár napojený na `upsertEntry`
   pre modul Vajcia.
8. **Offline fronta (native)** — SQLite write queue + `useSyncQueue` hook +
   offline indikátor banner.
9. **Obrazovka histórie (native)** — Rolovateľný zoznam záznamov, týždenné
   súčty.
10. **Webový dashboard** — Zrkadlo domácej obrazovky dát v Next.js.
11. **Polish** — Typografia, spacing, ikony, empty states, error states,
    slovenské texty vo všetkých UI komponentoch.

## Rozšírenosť modulov (Module Extensibility)

Pri implementácii akéhokoľvek kroku mysli na to, že `vajcia` sú prvý modul,
nie jediný. Komponenty a logika musia fungovať pre ľubovoľný modul
(`moduleId`, `label`, `unit`) — nie sú hard-coded pre vajcia. Nový modul
(napr. `zemiaky`, `jahody`) sa pridá registráciou v `convex/modules.ts`
bez zmeny existujúcich komponentov.

## Zvládanie chýbajúcich požiadaviek

- Nevymýšľaj produktové správanie, ktoré nie je definované v context súboroch.
- Ak je požiadavka nejednoznačná, vyrieš ju v príslušnom context súbore
  pred implementáciou.
- Ak požiadavka chýba, pridaj ju ako Open Question do `progress-tracker.md`
  a pozastav danú jednotku kým nie je otázka zodpovedaná.

## Chránené súbory (Protected Files)

Neupravuj nasledujúce bez explicitnej inštrukcie:

- `apps/web/src/components/ui/*` — shadcn/ui generované komponenty.
- `packages/backend/convex/_generated/*` — Convex auto-generované API typy.
- `apps/native/components/ui/*` — Core primitívne UI komponenty (po
  ustálení sa správajú ako lokálna komponentová knižnica).

## Udržiavanie dokumentácie v sync

Aktualizuj príslušný context súbor pri každej zmene, ktorá sa týka:

- Systémovej architektúry alebo hraníc → `architecture.md`
- Storage model rozhodnutí alebo nových tabuliek → `architecture.md`
- Nových kódových konvencií alebo organizácie súborov → `code-standards.md`
- Zmeny rozsahu features → `project-overview.md`
- Vizuálnych zmien → `ui-context.md`
- Všetkého ostatného → `progress-tracker.md`

## Pred prechodom na ďalšiu jednotku

1. Aktuálna jednotka funguje end-to-end v rámci definovaného rozsahu.
2. Nebol porušený žiadny invariant definovaný v `architecture.md`.
3. TypeScript kompiluje bez chýb v zmenených packages.
4. `npm run build` prebehne naprieč celým monorepom.
5. `progress-tracker.md` odráža hotovú prácu a ďalšiu jednotku.
6. Všetky nové architektonické rozhodnutia sú zaznamenané v
   `progress-tracker.md` pod **Architecture Decisions**.
