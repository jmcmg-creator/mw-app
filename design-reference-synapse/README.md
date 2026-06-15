# Handoff : Synapse Wealth Management — Dashboard, Immobilier, Portefeuille titres

## Overview

Application premium de **wealth management / family office** : consolidation multi-UBO / multi-entités d'un patrimoine multi-asset class (coté, immobilier, private equity, participations privées, cash, assurance-vie) avec suivi complet de la **dette** (immobilière, Lombard, corporate), du **levier (LTV)**, des **covenants**, des **plus-values latentes** et de la **qualité de donnée**.

Cas de démonstration : **Groupe FDL / Famille de Launay** — 84,2 M€ d'actifs bruts, 27,8 M€ de dette, 56,4 M€ de valeur nette. Toutes les données sont fictives.

Ce paquet couvre les écrans designés à ce stade :
1. **Dashboard global patrimoine** — 3 directions visuelles (A retenue par défaut, B clair + variante dark, C en exploration)
2. **Vue Immobilier** (Direction A)
3. **Table Portefeuille titres** (Direction A)
4. **Dette & Levier + module Lombard** (Direction A)
5. **Imports & réconciliation** (Direction A)
6. **Fiche actif détaillée** — drawer (Direction A)
7. **Déclinaisons mobile 390 px** des 3 directions

Un cahier des charges produit exhaustif (écrans restants : PV latentes, Acquisition Ledger, Exposure Analysis, Fonds/PE, Fiscalité, Documents/audit trail…) figure dans `SPEC_PRODUIT.md`.

## About the Design Files

Les fichiers HTML/JSX de ce dossier sont des **références de design créées en HTML** (React + Babel inline, styles inline). Ce sont des prototypes montrant le rendu et le comportement attendus — **pas du code de production à copier tel quel**.

La tâche est de **recréer ces designs dans l'environnement du codebase cible** (React + TypeScript + Tailwind CSS + Recharts, conformément au spec produit) en suivant ses patterns existants. S'il n'y a pas encore de codebase : Vite + React + TypeScript + Tailwind + Recharts est la stack recommandée.

`Dashboard — Directions.html` s'ouvre dans un navigateur et présente tous les artboards sur un canvas pan/zoom (la lib `lib/design-canvas.jsx` est uniquement un outil de présentation — **ne pas la porter**).

## Fidelity

**High-fidelity (hifi)** : couleurs, typographie, espacements, hiérarchie et contenus sont définitifs pour les écrans listés. Recréer pixel-perfect avec les libs du codebase. Les colonnes des tableaux, le wording français (format `75,8 M€`, virgule décimale, espace insécable avant %) et les badges d'état font partie du design.

**Statut important** : la direction visuelle finale n'a pas encore été tranchée par le client entre A (dark héritage), B (clair institutionnel, + variante dark) et C (cockpit décisionnel). **La Direction A est la référence par défaut** (fidèle au produit existant). Implémenter A en premier ; B/C documentées pour information. Le toggle clair/sombre est requis à terme — les deux jeux de tokens sont fournis.

## Design Tokens

Source exacte : `directions/tokens.jsx` (objets `SYN_DARK` / `SYN_LIGHT`).

### Couleurs — thème dark (défaut, Direction A/C)

| Token | Valeur | Usage |
|---|---|---|
| `page` | `#0B0F16` | Fond de page |
| `sidebar` | `#070A10` | Sidebar / tab bar |
| `card` | `#10151F` | Fond de carte |
| `cardAlt` | `#0D121A` | Lignes de sous-total, header de groupe |
| `border` | `#1D2533` | Bordures de cartes / inputs |
| `borderSoft` | `#161D29` | Séparateurs de lignes de tableau |
| `text` | `#E9EDF4` | Texte principal |
| `textMuted` | `#8B95A7` | Texte secondaire, labels |
| `textFaint` | `#5C6678` | Texte tertiaire, axes |
| `gold` | `#C9A45C` | Accent marque : nav active, eyebrows, CTA secondaires |
| `teal` | `#3FD6A4` | Valeurs positives, montants monétaires favorables |
| `blue` | `#5BA3EA` | Liens d'entités, badge « Nanti », look-through |
| `red` | `#E8696B` | Valeurs négatives, statut critique |
| `amber` | `#D9A441` | Alertes « watch », part taxable |
| `thBg` | `#0E131C` | Fond d'en-tête de tableau |
| `rowHover` | `#131927` | Hover de ligne, fond de barres de progression |

Variantes translucides pour fonds de badges : `tealDim rgba(63,214,164,.12)`, `redDim rgba(232,105,107,.12)`, `amberDim rgba(217,164,65,.12)`, `blueDim rgba(91,163,234,.12)`, `goldDim rgba(201,164,92,.12)`.

### Couleurs — thème light (Direction B / dark-mode toggle)

`page #F6F7F9 · card #FFFFFF · border #E4E7EC · borderSoft #EDF0F4 · text #15202F · textMuted #5F6B7E · textFaint #98A2B3 · gold #A37E33 · teal #0E9A72 · blue #2873C4 · red #C7484B · amber #B07F1F · thBg #F2F4F7 · rowHover #F3F5F8` (dims dans `tokens.jsx`).

### Couleurs d'allocation (donut, barres, légendes)

Dark : `immo #C9A45C · cote #3FD6A4 · pe #5BA3EA · priv #9A7BD0 · cash #5C6678 · av #3C4759`
Light : `immo #A37E33 · cote #0E9A72 · pe #2873C4 · priv #7A5BBF · cash #98A2B3 · av #C5CCD8`

### Typographie

- **UI** : `IBM Plex Sans` (Google Fonts), poids 400/500/600/700
- **Logo uniquement** : `Cormorant Garamond` 600, letter-spacing 0.22em (« SYNAPSE »)
- **Chiffres : `font-variant-numeric: tabular-nums` partout** (non négociable pour les tableaux financiers)
- Échelle : eyebrow/labels 9–10px uppercase ls 0.12em 600 · corps tableau 11.5–12px · KPI value 18–21px 600 · titre de page 26–28px 600 · hero net worth 32–44px 600 ls −0.01em
- Format français : virgule décimale, `M€`/`k€`, espace avant `%` et `×` (ex. `54,0 %`, `2,21×`, `+19,8 M€`)

### Espacements, rayons, ombres

- Grille de page : padding 20–26px, gap entre cartes 12–14px (dark dense) / 18–22px (light aéré)
- Cartes : radius 10px (dark) / 12px (light), padding 14–24px, bordure 1px, **pas d'ombre**
- Badges : radius 4px, padding 2px 7px, fontSize 11px 600, bordure `1px solid <couleur>33`
- Boutons/selecteurs : radius 7px, padding 7px 12px
- Cellules de tableau : padding 10–11px 14px ; en-têtes 9.5px uppercase ls 0.08em

## Screens / Views

### 1. Dashboard — Direction A « Héritage Synapse » (`directions/direction-a.jsx`, artboard 1440×1060)

- **Sidebar 208px** (fond `sidebar`, bordure droite) : logo Synapse, carte profil (avatar initiales 28px rond `goldDim`/`gold`), nav verticale 8 items avec icônes — item actif : texte `gold`, fond `goldDim`, bordure `gold` 20 %.
- **Scope bar** (rangée flex, gap 10) : OrganizationSwitcher « ◈ Consolidé global ▾ » (actif, 600), puis « UBO : Famille de Launay ▾ », « Mode : Look-through ▾ », « EUR ▾ » (muted) ; à droite badge neutre date des données + bouton outline gold « ⇩ EXPORT PDF ».
- **Titre** : eyebrow gold uppercase « PATRIMOINE CONSOLIDÉ », H1 « Dashboard » 28px, onglets Synthèse/Allocation/Performance/Risque (actif : gold + soulignement 2px).
- **KPI strip** : grid 6 colonnes — Valeur nette 56,4 M€ (teal) · Actifs bruts 84,2 M€ · Dette totale 27,8 M€ · LTV global badge teal 33,0 % · PV latentes +19,8 M€ teal (sub +30,7 %) · Cash 3,4 M€ (sub « + 2,8 M€ non tirés »).
- **Rangée 2** (grid 1.6fr/1fr) : carte « Valeur nette — 24 mois » (montant + badge +11,4 % 1 an, sélecteur période YTD/1A/3A/5A/Max, line chart avec dégradé teal, axe de dates, footer 4 métriques TRI 9,4 % / TRI net de dette 11,8 % / YTD +6,2 % / Revenus 12 m 2,31 M€) · carte « Allocation par classe d'actif » (donut 132px stroke 16, centre « 84,2 M€ / BRUT », légende 6 lignes valeur + %, pills Par UBO/entité/banque/devise).
- **Rangée 3** (grid 1.15fr/1fr/1fr) : « Dette & levier » (27,8 M€, coût moyen 3,42 %, 3 barres de répartition immobilière 19,6/Lombard 5,2/corporate 3,0, mini bar-chart maturités 2026→2031+ avec 2027 en amber) · « Plus-values latentes » (+19,8 M€ teal + badge %, net de dette +16,2 M€, 4 lignes par classe, badges « Part taxable indic. ≈ 7,4 M€ » amber + « Confiance : haute » neutre, lien « Voir le détail → » bleu) · « Alertes » (badge count amber, 4 alertes à puce colorée : covenant LTV watch, capital call, valorisation ancienne rouge, échéance relais bleue).
- **Rangée 4** : table 2 colonnes top contributeurs (teal) / destructeurs (red) avec rang, nom 600, entité en bleu, montant aligné droite.

### 2. Dashboard — Direction B « Clair institutionnel » (`directions/direction-b.jsx`, 1440×1010, props `{ dark }`)

Nav **horizontale** 58px (logo, 7 items, switcher scope, EUR, avatar). Hero : eyebrow gold, net worth 44px + badge 1 an, sous-ligne « brut − dette ». Bandeau 6 stats dans une carte unique à séparateurs verticaux. Rangée graphique 1.7fr/1fr (line chart + donut). Rangée 3 cartes (Dette avec barre empilée or/bleu/gris, PV latentes, Alertes). Boutons : « ⇩ Export PDF » outline + « + Ajouter un actif » plein (fond `text`, texte `page`). La prop `dark` bascule tous les tokens.

### 3. Dashboard — Direction C « Cockpit décisionnel » (`directions/direction-c.jsx`, 1440×940)

Rail d'icônes 56px. Header : titre + **segmented control de scope** (Consolidé/Par UBO/Par entité/Par banque/Net de dette/Dette seule — actif fond gold texte sombre) + **barre « Quelle est mon exposition à… ⌘K »**. Bandeau : carte net worth 270px (dégradé subtil) + 5 KPI risque (levier net 0,49×, LTV, coût dette, liquidité mobilisable 11,4 M€, actifs non grevés 41,7 M€). Corps 1.55fr/1fr : **waterfall brut→net** (84,2 − 19,6 − 5,2 − 3,0 = 56,4, barres or/rouge/teal, connecteurs pointillés) + maturités + top mouvements // rail droit : **carte Lombard** (bordure gauche bleue 2px, statut Healthy, 3 chiffres, jauge LTV avec seuils amber 60 % max / red 68 % appel de marge, ligne stress −20 %), **Covenants** (4 lignes nom/valeur/badge Watch-Healthy), **Qualité de donnée** (2 critiques rouges + 2 warnings amber).

### 4. Vue Immobilier — Direction A (`directions/view-immo.jsx`, 1440×1040)

Shell partagé `SynShellA` (sidebar + scope bar + titre, `directions/shell-a.jsx`). 8 KPI (Biens 5 · Valeur 38,5 M€ · Dette immo 17,4 M€ sub LTV moyen 45,2 % · Equity value 21,1 M€ teal · Loyers 1,20 M€ sub NOI 0,94 M€ · Rdt net 3,5 % · Cash-flow +186 k€ teal · PV latente +4,40 M€ teal). Graphe **valeur vs dette par bien** : barres horizontales superposées (valeur = fond `goldDim` bordure gold ; dette = rouge 70 % opacité) + légende. Carte **maturités dette immo** (2027 amber 4,95) + 4 lignes stats (fixe 88 % / variable 12 % / coût moyen 2,28 % / badge relais 2,1 M€ 03/2027). **Table 12 colonnes** : Bien (nom 600 + ville faint) · Entité (bleu) + quote-part · Prix de revient · Valeur (600) · Dette · LTV (badge amber si ≥ 54 %) · Taux·maturité · DSCR · Loyers 12m · Rdt net · PV latente (teal 600) · Confiance (badge Haute/Moyenne/Faible). Footer total fond `cardAlt`. Header de table : bouton gold « ⇪ Importer Excel immo ».

### 5. Portefeuille titres — Direction A (`directions/view-portfolio.jsx`, 1440×1020)

6 KPI (Valeur 22,40 M€ · Prix de revient 17,00 M€ · PV latente +5,40 M€ teal +31,8 % · Revenus 12 m 0,38 M€ · **Titres nantis 12,60 M€ sub 56 %** · TRI brut 12,4 % teal). Barre d'outils : recherche « titre, ISIN, ticker… », pills Grouper (actif gold)/Trier/Filtrer/Colonnes, export CSV·Excel à droite. **Table groupée par classe d'actif** (Actions cotées / ETF & fonds indiciels / Obligations) : ligne de groupe fond `cardAlt` avec pastille couleur allocation + sous-totaux ; colonnes Actif (nom 600 + chip ticker outline 9,5px) · Compte · Date d'achat · Qté · Prix moyen · Prix de revient · Valeur (600) · PV latente (teal/red 600) · % · Poids · Nanti (badge bleu « Nanti » ou « — »). Les ETF portent une sous-ligne bleue **look-through** : « ↳ look-through : NVDA 4,8 % · AAPL 4,1 % ». Footer total. Sous la table : badge « Look-through actif » + phrase exposition indirecte NVIDIA 0,28 M€.

### 6. Dette & Levier + module Lombard — Direction A (`directions/view-debt.jsx`, 1440×1160)

Shell `SynShellA`. **6 KPI** : Dette totale 27,80 M€ (sub LTV global 33,0 %) · Coût moyen pondéré 3,42 % (sub intérêts 12 m 948 k€) · Taux fixe/variable 74 % / 26 % · Maturité moyenne 4,8 ans · Collatéral mobilisé 42,5 M€ (sub actifs non grevés 41,7 M€) · Échéances 24 mois 6,40 M€ **en amber** (sub relais 2,1 M€ · 03/2027).

Rangée 1.25fr/1fr/1fr :
- **Carte Lombard UBS** (bordure gauche bleue 2px, badge Healthy) : 3 métriques (tiré/autorisé 5,2/8,0 · portefeuille nanti 14,9 · base éligible 12,6 après haircuts moy. 15 %), **jauge LTV horizontale** (barre teal 41,2 % sur fond `rowHover`, tick amber à 60 % = max, tick red à 68 % = appel de marge, légende 3 valeurs), **table de stress tests** 5 scénarios (Base/−10/−20/−30/−35 % → LTV stressé + marge + cash requis ; −30 % en amber 1,1 pt, −35 % en rouge « breach » avec cash requis 0,29 M€), footnote concentration NVDA 26 % de la base.
- **Dette par banque** : 5 barres horizontales or (CA 9,44 · BNP 9,30 · UBS 5,20 · SG 2,85 · CIC 1,01), footer « Concentration 1ʳᵉ banque 34,0 % ».
- **Maturités** (SynBars 2026→2031+, 2027 en amber) + **Covenants** (4 lignes : LTV Le Castellane 54,0/55 amber · LTV Lombard · ICR corporate · DSCR SAS Palace, pastille de statut).

**Table des 8 lignes de crédit** (colonnes : Crédit · Emprunteur (bleu) · Prêteur · Type · Taux · CRD/initial · Échéance · LTV·covenant (badge) · Collatéral · Statut (badge Watch amber / Healthy teal / « Refi à planifier » bleu)). Totaux cohérents : immo 19,6 (6 lignes dont crédit travaux 2,2 et relais 2,1 E3M+1,10 variable) + Lombard 5,2 (€STR+0,85 variable) + corporate 3,0 = **27,80 M€**. Header : bouton gold « ⇪ Importer échéancier ».

### 7. Imports & réconciliation — Direction A (`directions/view-imports.jsx`, 1440×1010)

**Stepper 5 étapes** (Upload → Mapping → Validation → Réconciliation → Import) : étapes 1-3 cochées teal, étape 4 active gold, étape 5 inactive ; à droite boutons « Rollback » (outline rouge) et « Confirmer l'import (38/42) » (plein gold, texte sombre).

Grid 300px/1fr :
- **Carte Fichier** : icône, nom `UBS_releve_juin2026.xlsx`, horodatage, puis 6 lignes clé/valeur (type détecté « Portefeuille titres », banque, compte masqué `CH92 ··· 4417`, UBO proposé, devises EUR(38)/USD(4), colonnes mappées 14/16). **Carte Lignes** : 42 lues / 38 valides (teal) / 4 à corriger (amber) + barre de progression bicolore.
- **Table Réconciliation — importé vs recalculé** (badge « 2 écarts » amber) : 5 agrégats (valeur de marché, prix de revient, PV latente, collatéral nanti, cash) × colonnes Importé (UBS) / Recalculé (Synapse) / Écart / Statut badge (OK teal, Écart amber). Montants précis à l'euro (`12 642 380 €`).
- **Table Lignes à corriger** (badge « 2 critiques » rouge) : pastille sévérité + actif + problème (coloré red/amber) + action recommandée + lien « Corriger → ». Cas : ISIN manquant, prix de revient absent, dates d'achat manquantes, doublon probable, UBO non rattaché.

**Historique des imports** : 4 batches (fichier, type, date, lignes, badge statut Réconciliation/Importé/Annulé-rollback, action Rollback ou Détail) + bouton « ⇪ Nouvel import ».

### 8. Fiche actif détaillée — drawer (`directions/view-asset.jsx`, 1440×1020)

**Pattern drawer** : la vue Portefeuille rend en arrière-plan, assombrie par un backdrop `rgba(4,6,10,0.62)` ; panneau latéral droit **620px**, fond `card`, bordure gauche.

- **Header** : nom « NVIDIA Corp » 20px + chip « NVDA · US67066G1040 », 4 badges (Action cotée · CTO UBS · UBO · **Nanti — Lombard UBS** bleu), bouton ✕.
- **Résumé** : grid 4×2 de mini-cartes `cardAlt` (valeur 5,40 M€, prix de revient 4,16 M€, PV +1,24 M€ teal, PV % +29,8 %, quantité 9 200, TRI +24,6 %, poids 6,4 %, dividendes 12 m).
- **Lots d'achat** (label « PMP 452,10 € · méthode FIFO disponible », lien Acquisition Ledger →) : table 3 lots (date, qté, PU, frais, coût, valeur, PV ± colorée, badge confiance Haute/Moyenne).
- **2 encarts côte à côte** : **Nantissement** (bordure gauche bleue : valeur nantie, haircut 25 %, valeur éligible 4,05 M€, part de la base 26 %, alerte amber concentration) · **Fiscalité indicative** (PFU 30 %, PV taxable, impôt latent ≈ 372 k€, PV nette, mention italique obligatoire « Estimation indicative. À valider par conseil fiscal. »).
- **Timeline d'investissement** (6 événements : valorisation, nantissement, dividende, achats — icône + date + libellé) · **Documents** (3 cartes fichier + zone pointillée « + Rattacher un document »).
- **Footer** : boutons « Audit trail » (outline) et « Voir l'exposition NVDA » (outline gold).

### 9. Mobile 390 px (`directions/mobile-a.jsx`, `-b.jsx` (prop `dark`), `-c.jsx`, 390×844)

Pattern commun : header logo/EUR/avatar → contenu scrollable → **tab bar** 5 items (Dashboard·Portefeuille·Dette·Exposition·Plus), item actif gold (A/C) ou text (B), safe-area 22px en bas. A : pills de scope horizontales, hero net worth 32px, sparkline, KPI grid 2×2, allocation en barre empilée + légende, carte alerte à bordure gauche amber. B : idem en clair avec carte graphique + donut. C : barre « Ask exposure », carte net worth dégradée, KPI risque 2×2, jauge Lombard avec seuils, covenants. Hit targets ≥ 44px.

## Interactions & Behavior

Le prototype est statique ; comportements attendus :

- **OrganizationSwitcher / scope bar** : tout changement de scope (consolidé, UBO, entité, banque, mode de consolidation, devise) refiltre **tous** les écrans. État global (React context ou store).
- Sélecteur de période du chart : YTD/1A/3A/5A/Max.
- Pills « Par UBO/entité/banque/devise » de la carte allocation : changent la dimension du donut.
- Lignes de tableau : hover `rowHover`, clic → drawer de détail d'actif (à designer, voir spec).
- « Voir le détail → » PV latentes → `/portfolio/unrealized-gains` ; alertes cliquables vers l'objet concerné.
- Tri par colonne, groupement, recherche texte, export CSV/Excel/PDF sur les tables.
- Badge LTV amber quand LTV ≥ seuil de covenant − 1 pt ; statuts Healthy/Watch/Breach selon `Covenant.status`.
- Look-through ETF : la sous-ligne est informative, clic → vue Exposition.
- Toggle clair/sombre : swap des objets de tokens (CSS variables recommandées).
- Skeleton loaders sur cartes/tableaux, empty states propres, tooltips pédagogiques sur les métriques calculées (TRI, LTV, DSCR, MOIC…).

## State Management

- `scope` global : `{ mode, uboId?, entityId?, bankId?, consolidation, currency }` — impacte toutes les requêtes/sélecteurs.
- `theme` : `"dark" | "light"` persisté.
- Données : voir les types TypeScript complets (UBO, OrganizationEntity, Asset, AcquisitionLot, CashFlow, Debt, Collateral, Covenant, Guarantee, UnderlyingHolding, ExposureResult, ImportBatch, DocumentReference, AuditTrailEntry, TaxProfile) **définis dans `SPEC_PRODUIT.md` §21**, ainsi que les 33 fonctions de calcul attendues (`calculations.ts`, §22) et leurs définitions financières exactes.
- Mock data de référence : objet `FDL` dans `directions/tokens.jsx` (chiffres cohérents entre eux : 84,2 brut − 27,8 dette = 56,4 net ; dette = 19,6 immo + 5,2 Lombard + 3,0 corporate).

## Assets

Aucune image binaire. Logo = texte « SYNAPSE » en Cormorant Garamond. Icônes du prototype = glyphes Unicode provisoires (◫ ≣ ↗ ⌂ ◍ ◎ ⇪ ▤) — remplacer par la lib d'icônes du codebase (Lucide recommandé : LayoutDashboard, Table, TrendingUp, Home, CircleDollarSign, Target, Upload, FileText).

## Files

| Fichier | Contenu |
|---|---|
| `Dashboard — Directions.html` | Canvas de présentation (ouvrir dans un navigateur) |
| `directions/tokens.jsx` | **Tokens dark/light, mock data FDL, atomes (SynLabel, SynBadge, SynCard, SynDonut, SynLine, SynBars, SynLogo)** |
| `directions/shell-a.jsx` | Shell Direction A (sidebar + scope bar) |
| `directions/direction-a.jsx` | Dashboard Direction A (référence) |
| `directions/direction-b.jsx` | Dashboard Direction B (light + prop dark) |
| `directions/direction-c.jsx` | Dashboard Direction C (cockpit) |
| `directions/view-immo.jsx` | Vue Immobilier |
| `directions/view-portfolio.jsx` | Table Portefeuille titres |
| `directions/view-debt.jsx` | Dette & Levier + module Lombard (stress tests, covenants) |
| `directions/view-imports.jsx` | Imports & réconciliation (stepper, écarts, rollback) |
| `directions/view-asset.jsx` | Fiche actif — drawer NVIDIA (lots, nantissement, fiscalité, timeline, documents) |
| `directions/mobile-a/b/c.jsx` | Mobiles 390 px |
| `lib/design-canvas.jsx` | Outil de présentation — **ne pas porter** |
| `SPEC_PRODUIT.md` | Cahier des charges produit complet (modèle de données, calculs, écrans restants, ordre d'implémentation) |

## Suggested prompt for Claude Code

> Lis `design_handoff_synapse/README.md` puis `design_handoff_synapse/SPEC_PRODUIT.md`. Implémente d'abord le design system (tokens, atomes, shell + scope bar), puis les écrans Direction A dans cet ordre : Dashboard, table Portefeuille + drawer fiche actif, Immobilier, Dette & Levier + module Lombard, Imports & réconciliation — en React + TypeScript + Tailwind + Recharts, en reproduisant fidèlement les designs HTML du dossier `directions/`. Respecte l'ordre d'implémentation du spec §10 et écris des tests unitaires pour les calculs financiers (dont Lombard et stress tests).
