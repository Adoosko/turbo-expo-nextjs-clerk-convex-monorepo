# UI Context

## Téma (Theme)

Iba svetlý režim. Dizajnový jazyk je **čistý rurálny zápisník** — teplé
biele pozadie, zemité zelené a jantárové akcenty, čisté zaoblené karty.
Pocit by mal byť ako dobre navrhnutý záhradný denník: vzdušný, čitateľný,
dôveryhodný. Žiadny dark mode. Žiadny glassmorphism. Žiadne ťažké gradienty.

Vizuálna inšpirácia: referenčný mockup používa full-bleed hero obrázky,
pill-shaped štatistické karty, horizontálne rolovacie selectory fariem
s náhľadovými fotkami, a tučné sekčné nadpisy. Tento jazyk preberáme
a zjednodušujeme pre doménu záhradníctva a chovu.

Tailwind CSS je jediný styling systém — na webe aj na natívnej appke (cez
NativeWind v4). Žiadny Bootstrap, žiadne inline štýly okrem výnimiek
definovaných v code-standards.md.

## Farby (Colors)

Všetky komponenty musia používať tieto CSS custom property tokeny — žiadne
hardcoded hex hodnoty v zdrojovom kóde. Na natívnej appke sa tieto hodnoty
mapujú cez `tailwind.config.js` theme extension.

| Rola               | CSS Variable          | Hodnota   | Poznámka                                      |
| ------------------ | --------------------- | --------- | --------------------------------------------- |
| Pozadie stránky    | `--bg-base`           | `#F8F6F1` | Teplá krémová, ako nelínkovaný papier         |
| Povrch (karty)     | `--bg-surface`        | `#FFFFFF` | Pozadie kariet a panelov                      |
| Zdvihnutý povrch   | `--bg-surface-raised` | `#EEE9DF` | Stlačený stav, jemná hĺbka                   |
| Primárny text      | `--text-primary`      | `#1C1A16` | Takmer čierna, teplý podtón                  |
| Tlmený text        | `--text-muted`        | `#78756C` | Štítky, metadáta, časové pečiatky            |
| Primárny akcent    | `--accent-primary`    | `#3D6B4F` | Šalviová zelená — farba značky               |
| Teplý akcent       | `--accent-warm`       | `#C97D2A` | Jantárová — vajcia, CTA tlačidlá             |
| Svetlý akcent      | `--accent-light`      | `#E5F0EA` | Šalviový odtieň pre pozadí odznakov          |
| Orámovanie         | `--border-default`    | `#E0DBD1` | Orámovanie kariet, oddeľovače                |
| Silné orámovanie   | `--border-strong`     | `#C2BBB0` | Obrysy vstupných polí                        |
| Chyba              | `--state-error`       | `#B83232` | Validačné chyby                              |
| Úspech             | `--state-success`     | `#3D6B4F` | Rovnaká ako accent-primary                   |
| Offline indikátor  | `--state-offline`     | `#C97D2A` | Jantárový offline banner                     |

## Typografia (Typography)

| Rola          | Font    | Váha      | Poznámka                                              |
| ------------- | ------- | --------- | ----------------------------------------------------- |
| Display/Hero  | Nunito  | 800       | Názov farmy, veľké čísla (počet vajec, kg úrody)     |
| UI text       | Inter   | 400 / 600 | Celý body text, štítky, tlačidlá                     |
| Numerické dáta| Inter   | 700       | Súčty, štatistiky — `font-variant-numeric: tabular-nums` |

Oba fonty sa načítavajú cez `next/font/google` na webe a cez
`@expo-google-fonts/nunito` + `@expo-google-fonts/inter` na natívnej appke.

Jazyk celého UI je **slovenčina**. Žiadne anglické reťazce v UI komponentoch
(kód, komentáre a identifikátory zostávajú v angličtine).

## Border Radius

| Kontext                | Trieda / hodnota               |
| ---------------------- | ------------------------------ |
| Inline / odznaky       | `rounded` → 6px                |
| Vstupné polia          | `rounded-lg` → 10px            |
| Karty / panely         | `rounded-2xl` → 16px           |
| Bottom sheet / modal   | `rounded-3xl` → 24px (vrch)    |
| FAB / kruhové          | `rounded-full`                 |

## Komponentová knižnica (Component Library)

**Web:** shadcn/ui na Tailwinde. Komponenty žijú v
`apps/web/src/components/ui/`. Pridávaj nové cez shadcn CLI; nepíš od nuly.

**Native:** Vlastné komponenty v `apps/native/components/ui/` štylizované
cez NativeWind. API komponentov drž konzistentné s webovými ekvivalentmi
kde to dáva zmysel (napr. `<Button variant="primary">`, `<Card>`, `<Badge>`).

## Layout vzory (Layout Patterns)

### Native (Expo Router)

- **Hlavná obrazovka (Dashboard):**
  Hero karta s názvom farmy (Nunito 800) + veľké dnešné číslo v jantárovej
  farbe. Pod ním horizontálne rolovateľné karty modulov (Vajcia, + ďalšie
  moduly v budúcnosti). Pod tým posledné záznamy.
  Plávajúce akčné tlačidlo (FAB) vpravo dolu — jantárové, `rounded-full`
  — na rýchle zaznamenanie.

- **Log modal (bottom sheet):**
  Vysunutý zdola. Výber modulu (ak nie je predvolený) → výber dátumu
  (predvolený dnešok) → číselný stepper pre hodnotu → potvrdenie.

- **Obrazovka histórie:**
  Rolovateľný zoznam zoskupený podľa týždňa. Každý riadok: dátum + modul
  odznak + hodnota + kto zaznamenal.

- **Obrazovka farmy:**
  Názov farmy, zoznam členov (iniciála avatara + meno + rola), sekcia
  pozývacieho kódu dole.

- **Tab bar:** 3 taby — Domov, História, Farma.
  Ikony z Feather setu, aktívny tab používa `--accent-primary`.

### Web (Next.js)

- **Dashboard:** Centrovaný kontajner (max-w-3xl), sticky horná navigácia
  s názvom farmy a avatarom používateľa. Rovnaké sekcie ako natívna domovská
  obrazovka, ale v mriežkovom layoute (2 stĺpce pre karty modulov).
- **Auth stránky:** Clerk hosted UI — bez vlastného stylovania.

## Ikony (Icons)

- **Native:** `@expo/vector-icons` Feather set. Veľkosť 22 pre tab bar,
  20 pre inline, 18 pre metadáta.
- **Web:** Lucide React. `h-4 w-4` inline, `h-5 w-5` tlačidlá.
- Iba stroke-based ikony. Žiadne filled varianty.

## Signaturný dizajnový prvok

Hero karta na hlavnej obrazovke zobrazuje dnešný celkový počet vajec ako
veľké jantárové číslo (Nunito 800, 64px, `--accent-warm`) na krémovom
pozadí s jemným šalviovým okrajom. Pod číslom malý tlmený text „vajec dnes".
Toto jedno číslo musí byť vizuálne dominantné nad všetkým ostatným
na obrazovke — je to prvá vec, ktorú farmár uvidí pri otvorení appky.
