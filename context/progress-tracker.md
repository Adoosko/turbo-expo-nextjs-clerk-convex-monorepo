# Progress Tracker

Aktualizuj tento súbor po každej zmysluplnej implementačnej zmene.

## Aktuálna fáza (Current Phase)

Fáza 2: Webová aplikácia & Integrácia Convex API — DOKONČENÉ.
Hlavné funkcie (tabs navigácia, hejno, denník, rodina) sú plne pripravené a otypované.

## Aktuálny cieľ (Current Goal)

Implementovať mobilnú aplikáciu (Expo) so zdieľanou Convex integráciou, offline SQLite frontou a synchronizáciou cez NetInfo.

## Hotové (Completed)

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
- **Dashboard UI/UX & Refaktoring (2026-06-17)** — Odstránili sme Laying Productivity Gauge z karty Prehľad. Pridali sme interaktívny mesačný kalendár znášky v Prehľade. Presunuli sme formulár na zápis znášky priamo pod Hero kartu pre lepsie prístupnosť na mobiloch. Nahradili sme presmerovanie pri úprave záznamu priamym editovacím dialógom v denníku. Zoznam v denníku sme zoskupili podľa mesiacov a týždňov s jasnými predelmi a pridali sme filter podľa mesiacov a full-text vyhľadávanie v poznámkach. Celý veľký komponent `Dashboard.tsx` (~1860 riadkov) sme refaktorovali do 8 samostatných pod-komponentov v adresári `src/components/dashboard` pre lepšiu udržateľnosť a vyriešili chyby s neuzatvorenými JSX tagmi.

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
