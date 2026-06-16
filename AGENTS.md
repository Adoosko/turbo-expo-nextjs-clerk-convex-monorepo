## Finik Farma — Application Building Context

Prečítaj nasledujúce súbory v poradí pred implementáciou alebo akýmkoľvek
architektonickým rozhodnutím:

1. `context/project-overview.md` — definícia produktu, ciele, funkcie,
   rozsah a kritériá úspechu
2. `context/architecture.md` — štruktúra monorepa, systémové hranice,
   modulárna architektúra, Convex schema, storage model a invarianty
3. `context/ui-context.md` — dizajnový systém: farby, typografia, border
   radius, layout vzory, Tailwind ako jediný styling systém
4. `context/code-standards.md` — TypeScript pravidlá, Tailwind pravidlá,
   slovenský jazyk UI, offline/sync pravidlá, Convex funkcie
5. `context/ai-workflow-rules.md` — poradie buildu, pravidlá rozsahu,
   modulárna rozšírenosť a definícia „hotové" pre každú jednotku
6. `context/progress-tracker.md` — aktuálna fáza, hotová práca, ďalšia
   jednotka, otvorené otázky a session poznámky

Aktualizuj `context/progress-tracker.md` po každej zmysluplnej implementačnej
zmene.

Ak implementácia mení architektúru, rozsah alebo štandardy dokumentované
v context súboroch, aktualizuj príslušný súbor pred pokračovaním.

### Rýchla referencia — kľúčové rozhodnutia

- **Stack:** Turborepo + Next.js (web) + Expo Router (native) + Convex
  (backend/DB) + Clerk (auth)
- **Styling:** Tailwind CSS na webe, NativeWind v4 na native — žiadny iný
  CSS framework
- **Jazyk UI:** slovenčina (kód a komentáre v angličtine)
- **Offline:** Expo SQLite write queue na native, flush cez NetInfo pri reconnect
- **Upsert pravidlo:** jeden `entry` na `(farmId, moduleId, date)` — druhý
  zápis updatuje, nevkladá nový riadok
- **Modulárna architektúra:** generická `entries` tabuľka + `modules.ts`
  register — nový produkt/zviera = nová registrácia modulu, nie nová tabuľka
- **Len svetlý režim**, teplá paleta — viď `ui-context.md`
- **Jedna farma per používateľ** v v1
- **Plánované moduly (nie v v1):** zemiaky, jahody, čučoriedky, ďalšie
  zvieratá, senzory, kamery
