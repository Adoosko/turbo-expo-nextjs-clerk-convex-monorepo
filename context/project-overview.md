# Finik Farma

## Prehľad (Overview)

Finik Farma je osobná aplikácia na sledovanie hospodárstva a záhrady — pre
rodinu Finik. Umožňuje zaznamenávať všetko, čo sa na farme pestuje alebo chová:
koľko vajec zniesli sliepky, koľko kilogramov zemiakov sa zozbieralo túto
sezónu, koľko jahôd, čučoriedok alebo inej úrody prišlo z pôdy. Aplikácia je
dostupná ako mobilná (Android/iOS cez Expo) aj webová (Next.js) — obe
zdieľajú rovnaké dáta v reálnom čase. Navrhnutá je tak, aby sa dala otvoriť
a záznam zadal za 10 sekúnd, aj bez internetu.

Aplikácia je **modulárna**: každý typ sledovania (vajcia, úroda, zvieratá,
rastliny) je samostatný modul. V1 implementuje modul **Sliepky → Vajcia**.
Ďalšie moduly sa pridávajú postupne bez zmeny architektúry.

## Ciele (Goals)

1. Člen rodiny môže zaznamenať dnešný výsledok (vajcia, úroda) za menej ako
   10 sekúnd.
2. Vlastník farmy môže pozvať členov rodiny — tí okamžite vidia a môžu
   editovať rovnaké dáta.
3. Záznamy zadané bez internetu sa uložia lokálne a automaticky synchronizujú,
   keď sa pripojenie obnoví. Žiadne dáta sa nestratia.
4. Architektúra podporuje ľahké pridávanie nových modulov (rastliny, zvieratá,
   senzory, kamery) bez prepisovania existujúceho kódu.

## Základný tok (Core User Flow)

1. Používateľ otvorí aplikáciu a prihlási sa cez Clerk.
2. Pri prvom spustení vlastník vytvorí Organizáciu cez Clerk (názov: „Finik Farma").
3. Vlastník pozve členov rodiny priamo cez Clerk UI (emailová pozvánka).
4. Pozvaní členovia prijmú pozvánku a ihneď majú prístup k farme.
5. Na hlavnej obrazovke člen vyberie modul (napr. Sliepky), ťukne na
   „Zaznamenať", zadá počet vajec a potvrdí.
6. Všetci členovia vidia aktualizáciu v reálnom čase.
7. V histórii je možné rolovať späť a pozrieť si záznamy podľa dňa, týždňa
   alebo sezóny.

## Funkcie (Features)

### Farma a rodina (Clerk Organizations)

- Vytvorenie farmy s názvom pomocou Clerk Organizations.
- Pozývanie členov cez email a správa rolí natívne v Clerku.
- Zoznam členov rodiny s rolami (admin / member) riadený Clerkom.

### Modulárne sledovanie

Každý modul definuje:
- **Typ záznamu** — čo sa zaznamenáva (počet kusov, hmotnosť v kg, počet
  kusov za sezónu, atď.)
- **Jednotku** — ks, kg, l, atď.
- **Ikonu a farbu** — vizuálna identita modulu na dashboarde.

**Modul v1 — Sliepky (Vajcia):**
- Denný záznam: dátum + počet vajec.
- Upsert: druhý záznam v ten istý deň prepíše existujúci, nevytvorí duplikát.
- 7-dňový sparkline na hlavnej obrazovke.
- História s týždennými a mesačnými súčtami.

**Plánované moduly (nie sú v scope v1):**
- Záhrada — úroda podľa plodiny (zemiaky kg, jahody ks, čučoriedky kg, …)
- Zvieratá — iné druhy zvierat, počty, zdravotné záznamy
- Senzory / kamery — vzdialené ovládanie dverí, live feed (fáza 3+)

### Offline podpora

- Záznamy zadané bez pripojenia sa uložia do lokálnej SQLite fronty.
- Fronta sa vyprázdni automaticky pri obnovení pripojenia.
- UI zobrazí diskrétny banner „Offline – zmeny sa synchronizujú".

## Rozsah v1 (Scope)

### V scope

- Jeden modul: Sliepky → denné záznamy vajec.
- Rodinný systém: vytvorenie farmy a členstvo riadené natívne cez Clerk Organizations.
- Offline write queue s automatickou synchronizáciou.
- Android-first via Expo; webový dashboard via Next.js.
- Slovenský jazyk v celom UI.
- Iba svetlý režim.

### Mimo scope v1

- Záhradné a rastlinné moduly.
- Ďalšie zvieratá okrem sliepok.
- Push notifikácie.
- Fotografie pri záznamoch.
- Tržby / predaj vajec.
- Viacero fariem na jeden účet.
- Tmavý režim.
- Kamery / vzdialené ovládanie.

## Kritériá úspechu (Success Criteria)

1. Prihlásený používateľ vytvorí farmu (organizáciu) cez Clerk za menej ako
   30 sekúnd.
2. Nový člen prijme Clerk pozvánku a okamžite vidí históriu vajec.
3. Záznam zadaný offline sa objaví v histórii po obnovení pripojenia, bez
   duplikátov.
4. Hlavná obrazovka sa načíta a je interaktívna do 2 sekúnd na bežnom
   Android zariadení.
5. `npm run build` prebehne bez TypeScript chýb vo všetkých packages.
