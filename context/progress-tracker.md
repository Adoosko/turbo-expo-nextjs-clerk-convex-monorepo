# Progress Tracker

Aktualizuj tento súbor po každej zmysluplnej implementačnej zmene.

## Aktuálna fáza (Current Phase)

Fáza 1 (vylepšenia): Skladový systém, Denník refaktor & Code Quality — DOKONČENÉ.
Webová aplikácia a backend sú plne aktualizované o evidenciu skladu a výdajov s prísnym otypovaním.

## Aktuálny cieľ (Current Goal)

Pripraviť nasadenie a pokračovať na mobilnej aplikácii (Expo) so zdieľanou Convex integráciou a offline SQLite synchronizáciou.

## Hotové (Completed)

- **Vizuálny redizajn bento kariet & Kalendár bez layout shiftov (2026-06-22)**:
  - Odstránili sme layout shift v kalendári (`MonthlyCalendar.tsx`) — aktívny deň už nemení veľkosť písma (`text-xs` zostáva zachovaný) a prechody sa namiesto `ring` prepínajú cez stabilný `box-shadow`.
  - Presunuli sme bento karty na prehľade (Mesačný kalendár, Týždenný vývoj, Stav hejna) na čisté svetlé pozadie `bg-bg-surface border border-border-default/30 shadow-none` pre prémiový vzhľad.
- **Štatistika Rekord & Mobilné štatistiky v Denníku (2026-06-22)**:
  - Pridali sme novú metriku „Rekord“ (historické maximum znášky v jeden deň) do prehľadového Quick Stats Bento gridu ako štvrtú dlaždicu.
  - V tabuľkovom prehľade Denníka sme sprístupnili štatistiky „Priemer“ a „Rekord“ aj pre mobilné zobrazenie (odstránením responzívnych obmedzení z panela nástrojov).
- **Vizuálne ikony v Denníku (2026-06-22)**: Pridali sme miniatúru obrázka vajca (`/egg.png`) k zobrazeniu množstva (ks) v riadkoch tabuľky Denníka (pre desktop aj mobil), čím sme zvýšili vizuálnu atraktivitu a prepojili tabuľku s celkovým dizajnom (len pre modul 'vajcia').
- **Denník Redesign & Mobile Sticky Bottom Navigation (2026-06-22)**:
  - Redizajnovali sme Denník na modernú, kompaktnú dátovú tabuľku so zebra stripingom, hover efektmi, dynamic stat barom a staggered načítavaním riadkov.
  - Vytvorili sme responzívnu navigáciu: na mobiloch (`md:hidden`) sa horné capsule menu nahradí fixnou spodnou navigačnou lištou so stredovými ikonami a malými popiskami, čo výrazne uľahčuje mobilné používanie. Na desktope zostáva pôvodné pill-menu.
- **Skladový systém & Výdaje (2026-06-22)**: Implementovali sme skladový systém vajec s evidenciou príjmov (znáška) a výdajov (dôvody: predaj, darovanie, spotreba, kazené). Upravili sme schému entries o type/reason s unikátnosťou (orgId, moduleId, date, type).
- **HeroLoggerCard & Prehľad (2026-06-22)**: Prepracovali sme HeroLoggerCard na dominantné zobrazenie stavu skladu a dve akčné vetvy (+ Znáška, − Výdaj) s inline stepper formulármi. Pridali sme stav skladu do hlavných štatistík PrehladTab.
- **Denník Refaktor & Oprava Vyhľadávania (2026-06-22)**: Zjednodušili sme Denník na čistý plochý layout pod mesačnými hlavičkami (odstránené timeline linky a týždenné predelenia). Záznamy sú farebne odlíšené (zelená príjem, jantárová výdaj s dôvodom). Vyhľadávanie teraz komplexne prehľadáva autorov, dátumy, množstvá a typy, a všetky zobrazené štatistiky v denníku sa dynamicky prepočítavajú podľa filtrov.
- **Zdieľané Komponenty & Code Quality (2026-06-22)**: Vytvorili sme zdieľané typy (types.ts), ModuleSelector, EggIcon a potvrdzovací dialóg ConfirmDialog. Odstránili sme @ts-nocheck a any typy. Pnpm typecheck a build prebehol bez chýb.

- Context súbory napísané, finalizované a zosúladené s verziami (pnpm workspaces, Next.js 16, Expo SDK 55).
- Úspešná inštalácia dependencií v celom monorepe vrátane `@radix-ui/react-dialog` pre shadcn Dialog.
- Konfigurácia lokálnych environment súborov s produkčným Cloud Convex URL a Clerk placeholder hodnotami.
- Overenie kompilácie monorepa: `pnpm run typecheck` a `pnpm run build` prebehli úspešne bez chýb.
- Rozhodnutie o modulárnej architektúre a Tailwind CSS ako jedinom stylingu.
- Jazyk UI: slovenčina.
- **Convex API** — Implementované queries a mutations (`modules:list`, `modules:seed`, `entries:upsert`, `entries:list`, `entries:getDashboardData`) s podporou len svetlého režimu, JWT authentication, a Clerk Organizations.
- **Automatický modulový seeding** — Pri volaní `modules:list`, ak je databáza pre danú farmu prázdna, systém dočasne vráti default modul `vajcia` a pri prvom zápise zápisová mutácia automaticky vygeneruje chýbajúcu modulovú tabuľku, čím zaistí bezproblémový štart bez nutnosti manuálneho seedovania.
- **Webový Dashboard (Next.js)** — Napojená autorizácia a prepínanie fariem cez Clerk `<OrganizationSwitcher />` a `<UserButton />`. Implementovaný úvodný onboarding (výzva k výberu/vytvoreniu farmy v slovenčine) a hlavný dashboard s widgetom pre stepper záznam vajec a zoznamom posledných záznamov.
- **Prehľad, Hejno, Denník, Rodina Tabs** — Prepracované používateľské prostredie do premium plochého plochého designu s 4 hlavnými kartami.
- **Hejno (Chicken Flock)** — Zavedený statický slovenský katalóg 8 prednastavených plemien s Unsplash obrázkami a popismi (`presets.ts`). Pridaná možnosť vytvárať vlastné plemená, vyberať ich farebné označenie a nahrávať vlastné fotky priamo cez Convex Storage (`generateUploadUrl`). Pridané tlačidlo **"Vytvoriť predvolené hejno" (7ks)** pre zrýchlený štart a onboarding prázdneho kurníka.
- **Flock Overview & Productivity (2026-06-17)** — Na karte Prehľad pribudla nová sekcia **Stav hejna** so stohovaným grafom zloženia a zoznamom plemien. Nahradili sme jednoduché farebné krúžky v zozname plemien skutočnými okrúhlymi fotkami plemien (s farebným lemom prislúchajúcim danému plemenu pre prepojenie s grafom).
- **Denník Logger Avatar, Responzívnosť & Sticky Header (2026-06-17)** — Nahradili sme textový štítok „Vy / Rodina“ v denníku skutočnými profilovými fotkami (avatarmi) členov rodiny, ktorí záznam vytvorili. Aby sme predišli prekrývaniu a zväčšovaniu kariet, zachovali sme jednoradkový layout a skrátili formát dátumu na mobiloch na ultra-kompaktný numerický tvar (napr. „17.6.“ namiesto „17. júna 2026“) spoločne s optimalizáciou paddingov, čím sme dosiahli dokonalú prispôsobivosť. Taktiež sme opravili lepkavé (sticky) hlavičky mesiacov zvýšením z-indexu na `z-20` a nastavením pevného pozadia `bg-bg-base`, aby sa záznamy pri posúvaní nesprávne neprekrývali.
- **Rodina (Family)** — Nahradený defaultný Clerk `<OrganizationProfile />` vlastným prehľadným zoznamom členov s ich profilovými fotkami/avatarmi, menami, e-mailami a rolami (Správca vs. Člen).
- **Prístupnosť a responzívnosť (Accessibility & Responsiveness)** — Zväčšili sme písmo (odstránenie mikro-textov pod `text-xs`/`text-sm`, zväčšenie textu na `text-base`/`text-lg`/`text-xl`) a ovládacie prvky (steppre `w-10 h-10` s `h-5 w-5` ikonami, tlačidlá s výškou `h-12`) pre starších používateľov. Navigačné taby sa na mobiloch posúvajú horizontálne bez zalamovania, a tabuľka denníka na mobiloch skrýva vedľajšie stĺpce, čím sme dosiahli perfektný vzhľad na 320px displejoch (iPhone SE).
- **Vizualizácie a grafika (Visualizations & Graphics)** — Pridali sme interaktívny ukazovateľ priemerného výkonu znášky na sliepku (Laying Productivity Gauge) a stohovaný farebný distribučný graf plemien (Flock Distribution Bar) v novom paneli **Stav hejna** na karte Prehľad s plnohodnotným slovakizovaným skloňovaním.
- **Lokálne assety (Local Assets)** — Aktualizovali sme prednastavený obrázok pre kohúta v `presets.ts` na novú lokálnu verziu `/chickens/leghorn-kohut.png` uloženú používateľom.
- **Kalendár znášky (2026-06-17)** — Prepracovali sme mesačný kalendár znášky v Prehľade do podoby jednotnej a čistej mriežky (`w-full aspect-square`). Všetky políčka majú teraz rovnakú veľkosť bez ohľadu na obsah, čo odstraňuje vertikálne preťahovanie riadkov. Prázdne dni majú jemné neutrálne pozadie `bg-bg-base/40` na vytvorenie vizuálnej mriežky, zapísané dni majú svetlozelené pozadie `bg-accent-light/45` a vybrané dni sú zvýraznené plným zeleným blokom `bg-accent-primary` s bielym textom. Odstránili sme zbytočné ohraničenia (borders) v súlade s plochým dizajnom a zjemnili rezy písma.
- **Plávajúci a zaoblený dizajn navigácie (2026-06-17)** — Kompletne sme prepracovali vrchný header aj prepínacie záložky (Tabs) na plávajúci štýl (Floating Capsule). Vrchný panel aj záložky majú teraz výrazne zaoblené rohy (`rounded-2xl`) a bočné odsadenie. Odsadenie a paddingy záložiek sme zúžili a zjemnili (`py-2 px-4` a `text-sm` s `h-4.5` ikonami), aby neboli príliš robustné, pričom sa zachoval čistý moderný vzhľad bez ohraničení.
- **Textové logo Farma Finik (2026-06-17)** — Nahradili sme staré logotypy (obrázok a text „UseNotes“) novým zjednoteným textovým logom „Farma Finik“ s vlastným SVG symbolom. Logo je plne otypované, integrované do zdieľaného komponentu `<Logo />` a úspešne nasadené v dashboarde aj na verejnom headeri s podporou automatického skrývania textu na mobilných displejoch.
- **Dashboard UI/UX & Refaktoring (2026-06-17)** — Odstránili sme Laying Productivity Gauge z karty Prehľad. Pridali sme interaktívny mesačný kalendár znášky v Prehľade. Presunuli sme formulár na zápis znášky priamo pod Hero kartu pre lepsie prístupnosť na mobiloch. Nahradili sme presmerovanie pri úprave záznamu priamym editovacím dialógom v denníku. Zoznam v denníku sme zoskupili podľa mesiacov a týždňov s jasnými predelmi a pridali sme filter podľa mesiacov a full-text vyhľadávanie v poznámkach. Celý veľký komponent `Dashboard.tsx` (~1860 riadkov) sme refaktorovali do 8 samostatných pod-komponentov v adresári `src/components/dashboard` pre lepšiu udržateľnosť a vyriešili chyby s neuzatvorenými JSX tagmi.
- **Sledovanie kuriatok (2026-06-18)** — Pridaná možnosť sledovať a počítať mladé vyliahnuté kuriatka v kŕdli (Hejno). Vygenerovali sme pre nich dedikovaný lokálny obrázok `/chickens/kuriatko.png` a zaregistrovali preset `kuriatko`.
  - Štatistiky na karte Prehľad boli upravené tak, aby sa kuriatka nezapočítavali medzi znášajúce sliepky. Vek a predpokladaná znáška sa teraz zobrazujú priamo v prehľade v zátvorkách pri počte kusov.
  - Implementované rozšírené formátovanie veku kuriatok: pre vek nad 30 dní zobrazuje kombináciu mesiacov a týždňov (napr. `1 mesiac a 2 týždne`).
  - Prepracovaný layout karty zvieraťa na karte Hejno podľa vizuálneho návrhu: názov a farebná bodka hore, pod nimi dva zaoblené odznaky (pills) s ikonami (`Clock` pre vek, `Egg` pre predpokladaný začiatok znášky vo formáte `M/YYYY`), popis a odkaz na detaily plemena. Spodná časť obsahuje horizontálny jednoradkový panel s popisom „Počet“, stepperom pre zmenu stavu a akciou „→ Preradiť na nosnice“ vedľa seba.

## V procese (In Progress)

- Príprava architektúry pre mobilnú aplikáciu (Expo / React Native).

## Ďalšie kroky (Next Up)

1. **Native Bootstrap & Layout** — Prepísanie index obrazovky mobilnej aplikácie a tab bar navigácie na 3 taby: Domov (Dashboard), História, a Nastavenia farmy.
2. **Offline Queue (SQLite)** — Vytvorenie a registrácia SQLite databázy a hookov `useOfflineQueue` a `useSyncQueue` na spracovanie offline zápisov.

## Otvorené otázky (Open Questions)

- Má pozývací kód exspirovary? → Vyriešené prechodom na Clerk (riadi Clerk).
- Je jedna farma per používateľský účet tvrdé pravidlo? → Clerk prepínač umožňuje viacero fariem, čo prekonáva pôvodné MVP obmedzenie a dáva rodine flexibilitu.
- Majú offline záznamy v histórii native appky svietiť okamžite (optimisticky) pred synchronizáciou, eller až po potvrdení? → Tendencia k optimistickému zobrazeniu; potvrdíme pri implementácii.

## Architektonické rozhodnutia (Architecture Decisions)

- **Modulárna architektúra (generická `entries` tabuľka):** Jedna tabuľka pre všetky záznamy s modulovým slugom.
- **Offline queue stratégia:** `expo-sqlite` pre natívnu frontu na ukladanie lokálnych dát a postupné odosielanie do Convex pri opätovnom pripojení.
- **Prepínanie a správa fariem:** Delegované na Clerk Organizations.

## Session poznámky (Session Notes)

- Next.js 16+ vyžaduje `src/proxy.ts` namiesto klasického `middleware.ts` na spracovanie Clerk middleware ochrany.
- Typescript test (`pnpm run typecheck`) prešiel na 100% po vyladení parametrov `<UserButton />` (odobraný starý `afterSignOutUrl` parameter pre kompatibilitu s novým Clerk SDK).
- Opravené nekonečné načítavanie: odstránená koncová lomka z `NEXT_PUBLIC_CONVEX_URL` v `.env.local`, čím sa predišlo chybnej adrese `cloud//api/...` pre WebSocket.
- Opravená chyba autorizácie (Unauthorized to access this farm): Clerk v predvolenej Convex šablóne komprimuje claims do objektu `identity.o.id` (namiesto `identity.org_id`). Pridaný helper `getOrgId` v `utils.ts` na spoľahlivú extrakciu orgId v oboch tvaroch.
- Optimalizácia pre iPhone SE: pridaná podpora pre horizontálne posúvanie tabov bez zalamovania a zavedená `@utility scrollbar-none` v Tailwind v4 na skrytie scrollbarov.
- Zväčšenie rozloženia: steppre boli upravené na `w-10 h-10` a tabuľky optimalizované so skrytými vedľajšími stĺpcami na mobiloch na zväčšenie textového obsahu.
- Pridané vizuálne grafiky a stav hejna:
  - Laying Productivity Gauge: `Math.round((todayValue / totalHens) * 100)` s plynulým progress barom.
  - Flock Distribution Bar: stohovaný bar v novej karte **Stav hejna** so skloňovaním (napr. `sliepka`, `sliepky`, `sliepok`).
- Skrátený dátum v Denníku: pridaná funkcia `formatDateSlovakShort` pre odľahčenie tabuľkového výpisu.
na zväčšenie textového obsahu.
- Pridané vizuálne grafiky a stav hejna:
  - Laying Productivity Gauge: `Math.round((todayValue / totalHens) * 100)` s plynulým progress barom.
  - Flock Distribution Bar: stohovaný bar v novej karte **Stav hejna** so skloňovaním (napr. `sliepka`, `sliepky`, `sliepok`).
  - Table Quantity Graphics: miniatúrne stĺpce v Denníku počítané cez `Math.max(...allEntries.map(e => e.value), 1)`.
