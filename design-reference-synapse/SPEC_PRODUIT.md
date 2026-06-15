# SPEC PRODUIT — Synapse Wealth Management / Family Office

Cahier des charges produit complet (résumé structuré du brief client). Référence pour Claude Code.

## 1. Objectif

Outil décisionnel patrimonial **fiable, précis, auditable** : suivre, consolider, analyser et auditer un patrimoine multi-asset class. Inspirations : Addepar (consolidation multi-entités), BlackRock Aladdin (exposition/risque), Finary (lisibilité), Kubera (bilan global), Altoo/Canopy/Arch (rigueur institutionnelle). Utilisateurs : entrepreneur, family office, banquier privé, CFO patrimonial, conseil fiscal, investisseur multi-actifs.

Classes d'actifs & passifs : ETF, actions, obligations, produits structurés, private shares, participations, fonds, PE, immobilier, cash, assurance-vie, PEA/PEA-PME, comptes-titres, holdings, véhicules, projets — et dettes : immo amortissable/in fine, relais, Lombard, margin loan, corporate, crédit-bail, dette privée, mezzanine, prêt actionnaire, CCA, découvert ; garanties, sûretés, collatéral, covenants.

## 2. Questions auxquelles l'app répond immédiatement

Valeur nette consolidée · actifs bruts · dette totale (par banque/UBO/entité/actif) · exposition Lombard · levier total/net · LTV global et par actif · liquidité disponible · localisation des PV latentes · dates d'achat réelles · vrai prix de revient · PV réalisées · revenus encaissés · TRI réel et net de dette · rentabilité de l'equity · exposition à un titre (ex. Nvidia) directe + indirecte (ETF/fonds/mandats) · exposition par UBO/entité/banque/devise/pays/secteur · fiabilité des chiffres (données incomplètes, sans date d'achat, sans prix de revient auditable) · documents justificatifs · maturités de dette · covenants à surveiller · collatéral mobilisé · marge avant appel de marge · risque de refinancement · coût moyen pondéré de la dette · périmètre taxable indicatif.

## 3. Organisation par UBO & scopes

Organisation par **UBO et périmètre économique**, pas seulement juridique. `OrganizationSwitcher` global : Consolidé global / Par UBO / Par entité / Par banque / Par portefeuille / Par véhicule / Par projet / Par classe d'actif / Par devise / Par pays / Par fiscalité / Liquid assets only / Net of debt / Gross assets / Debt only / Leveraged assets only / Unencumbered assets only / Pledged assets only.

Sélecteurs : UBOSelector, EntitySelector, PortfolioScopeSelector, ConsolidationModeSelector, CurrencySelector, ReportingCurrencySelector, DebtScopeSelector, LeverageModeSelector.

**Le changement de scope impacte tous les écrans** (dashboard, portefeuille, PV latentes, ledger, exposition, immobilier, fonds, dette, fiscalité, documents, audit, imports, exports).

Modes de consolidation : full, look-through, proportional ownership, direct only, excluding debt, net of debt, gross, debt only, taxable perimeter, liquid only, family consolidated, pledged only, unencumbered only.

Chaque actif est rattachable à : UBO, entité détentrice, holding, banque, compte, véhicule, projet, classe d'actif, pays, devise, source de données, niveau de confiance, documents, dette(s), collatéral, garantie, covenant, maturité, risque de refinancement.

## 4. Écrans

### 4.1 Dashboard global (designé — voir README)
KPIs obligatoires : net worth, actifs bruts, dettes (totale/immo/Lombard/corporate/privée), cash, valeur investie/marché/nette, equity investie, PV latentes (brutes/nettes de dette/réalisées), revenus 12 m, cash-flow net, coût annuel dette, intérêts 12 m, TRI global/net de dette, perf YTD/1/3/5 ans, LTV global et par classe, maturités 12/24/36 m, allocations (classe/devise/UBO/entité/banque/pays/liquidité/risque), top 5 contributeurs/destructeurs, alertes.

### 4.2 Table portefeuille multi-asset (designée pour le coté)
46 colonnes max (nom, classe, sous-classe, UBO, entité, banque, compte, véhicule, projet, devise, qté, ISIN, ticker, dates d'achat initiale/dernière/fiscale, prix moyen, prix de revient, frais, valeur brute, dette associée, valeur nette, equity investie, source+date de valorisation, PV latente brute/nette/%, PV réalisée, revenus, perf totale/annualisée, TRI, TRI net, MOIC, LTV, coût+type+maturité dette, collatéral, liquidité, risque, fiscalité, documents, statut donnée, confiance). Tri/filtres/recherche/groupements (classe, UBO, entité, banque, projet, type de dette), exports CSV/Excel/PDF, drawer de détail au clic.

### 4.3 Fiche actif détaillée (à designer)
Sections : A. Résumé · B. Timeline d'investissement (achats, frais, tirages/remboursements de dette, intérêts, refinancements, distributions, dividendes, coupons, loyers, capital calls, ventes partielles, changements de valo, documents, événements fiscaux, modifications manuelles) · C. Lots d'achat (dates trade/règlement/fiscale, qté, PU, frais, devise, FX, coût en devise locale + reporting, valeur du lot, PV du lot, durée de détention, justificatif, statut de validation) · D. Dette & levier (prêteur, type, montants, taux, index+marge, all-in, échéancier, in fine/amortissable, LTV initial/actuel, covenant + marge de sécurité, collatéral, garanties, nantissement/hypothèque, risque de refi) · E. Performance (brute, nette de frais, nette de dette, rentabilité equity, annualisée, TRI, TRI net, MOIC, contribution, benchmark) · F. Fiscalité indicative (régime présumé, PV taxable estimée, taux indicatif, impôt latent, date fiscale, certitude, mention obligatoire « Estimation indicative à valider par conseil fiscal. ») · G. Documents (acte d'achat, relevés, rapports de valo, contrats de prêt/Lombard, tableaux d'amortissement, nantissements, hypothèques, covenant certificates, capital calls, distribution notices, relevés fiscaux, factures).

### 4.4 /portfolio/unrealized-gains (à designer)
PV latente totale brute/nette de dette, par classe/UBO/entité/banque/pays/devise/année d'achat/durée de détention ; top gagnants/perdants ; positions à problème (prix de revient incomplet, sans date fiable, valo ancienne, dette mal rattachée, fiscalité incertaine). Graphiques : waterfall coût→valeur brute, waterfall brut→net de dette, bar par classe, heatmap gain/perte, histogramme par année d'achat, matrice durée×PV, historique PV latente, brute vs nette. Clic → lots, prix de revient, justificatifs, méthode de calcul, dette, fiscalité, alertes qualité.

### 4.5 /portfolio/acquisition-ledger (à designer)
Audit de toutes les dates d'achat et prix de revient. Colonnes : actif, classe, UBO, entité, lot, date contractuelle, date règlement, date fiscale, qté, PU, frais, devise, FX, coût total, dette d'acquisition, equity investi, source, document, statut de validation, commentaire. Mise en évidence : dates manquantes, incohérences contractuel/règlement, prix incomplet, frais non affectés, devise absente, document manquant, actif sans UBO/entité, dette non affectée, doublon probable.

### 4.6 /portfolio/debt-leverage (à designer)
Pilotage de toutes les dettes/levier/collatéral. Agrégats : dette totale, par type/banque/UBO/entité/actif/devise, fixe vs variable, taux moyen pondéré, intérêts 12 m, maturité moyenne, échéances 12/24/36 m, LTV global/par actif/banque/entité, collatéral total/mobilisé, actifs grevés/non grevés, marge de sécurité, covenants actifs/proches du seuil, appels de marge potentiels, risque de refi, sensibilité aux taux. Détail par dette : 33 champs (prêteur→documents). Composants : DebtDashboard, DebtTable, DebtDetailDrawer, LombardLoanCard, RealEstateDebtCard, DebtMaturityChart, InterestCostChart, LTVMonitor, CovenantMonitor, CollateralCoverageCard, MarginCallRiskCard, RefinancingRiskCard, DebtByBank/UBO/EntityChart.

### 4.7 Module Lombard (esquissé en Direction C)
Par ligne : banque, emprunteur, UBO, tiré/autorisé, devise, taux+marge, portefeuille nanti + valeur, borrowing base, haircut moyen, LTV actuel/max, marge de sécurité, seuils d'appel de marge et de liquidation, collatéral éligible/non éligible, concentrations (titre/ETF/devise/secteur/pays), stress tests −10/−20/−30 %, appel de marge estimé, cash nécessaire pour revenir dans les covenants.
Formules : `collateralValue = Σ actifs nantis` · `eligibleCollateralValue = Σ actifs éligibles après haircuts` · `borrowingBase = eligibleCollateralValue` · `lombardLTV = outstandingDebt / eligibleCollateralValue` · `safetyMargin = maxLTV − lombardLTV` · `requiredCollateralValue = outstandingDebt / maxLTV` · `marginCallDistance = collateralValue − requiredCollateralValue` · `stressedLTV = outstandingDebt / stressedCollateralValue`.
Statuts : healthy / watch / breach / margin call risk / liquidation risk.

### 4.8 Vue Immobilier (designée — voir README)
Par bien : adresse, ville, pays, UBO, société, quote-part, prix d'achat + frais notaire/agence + capex = prix de revient complet, dette (type, CRD, taux, mensualité, maturité), LTV, DSCR, valeur + source + date, PV brute/nette, equity value, loyers, charges, NOI, rendements brut/net, cash-flow, TRI immo/net de dette, documents. Graphiques : valeur vs dette, évolution LTV, cash-flow mensuel, rendement par bien, PV par bien, maturités, coût de dette, fixe vs variable.

### 4.9 Fonds / PE / Private shares (à designer)
Engagement, appelé, restant à appeler, distributions, NAV, TVPI, DPI, RVPI, MOIC, TRI, souscription, millésime, GP, stratégie, géographie, devise, frais, carried, dette de financement, coût de portage, dernier reporting, confiance NAV, documents. UX : calendriers d'appels/distributions, alertes capital calls, vues par millésime/GP/stratégie/dette/restant à appeler.

### 4.10 /portfolio/exposure-analysis (à designer, esquissé en C)
Barre « Ask your exposure » (langage naturel) : exposition à un titre/secteur/indice/devise/pays/banque/taux variable/vintage/stress −20 %/maturités 24 m/actifs nantis. Traverse : actions directes, ETF, fonds, mandats, produits structurés, participations, immo indirect, dettes, cash, devises, contreparties, collatéral. Résultat : exposition brute/nette, % du patrimoine, % des actifs financiers, par UBO/entité/banque/portefeuille/instrument, directe/indirecte/look-through/estimée, source + confiance + alertes. Composants : ExposureSearchBar, ExposureSummaryCard, ExposureBreakdownTable, Direct/IndirectExposureCard, LookThroughExposurePanel, ExposureConfidenceBadge, ExposureByUBO/Entity charts, ExposureByInstrumentTable.

### 4.11 Look-through ETF/fonds
Chaque instrument : holdings sous-jacents (poids, date reporting, source, fraîcheur, confiance). `exposition indirecte = valeur position × poids du sous-jacent`. Cas : holdings disponibles / partiels / indisponibles / estimation benchmark / estimation secteur / impossible. Statuts : verified / reported / estimated / stale / unavailable.

### 4.12 Fiscalité indicative
PV taxables estimées, PV réalisées, dividendes, coupons, revenus fonciers, distributions ; par UBO/entité/pays/régime ; impact intérêts déductibles ; positions à documenter/incertaines ; export expert-comptable. **Mention obligatoire : « Estimation indicative. À valider par conseil fiscal. »**

### 4.13 Documents & audit trail
Rattacher un document à : actif, transaction, valorisation, dette, covenant, collatéral, flux. Historique de modifications (qui/quoi/quand), source des valorisations, rollback d'import, validation manuelle.

### 4.14 Imports
**Immobilier Excel** : colonnes assetName→notes (33 colonnes types), détection auto + mapping manuel, validation, doublons, valeurs manquantes, incohérences, préview, rattachement UBO/entité, création actifs+dettes+coûts+dates+valos+alertes. Composants : RealEstateExcelUploader, ColumnMappingModal, ImportPreviewTable, ImportValidationPanel, DuplicateDetectionPanel, ImportSummaryCard.
**Portefeuille financier** (Excel/CSV/PDF structuré) : relevés, CTO, PEA, AV, mandats, reportings, fichiers Lombard/collatéral/dette. Mapping intelligent ISIN/ticker/nom, normalisation devises, conservation dates d'achat et prix de revient, recalcul des PV + **comparaison importé vs recalculé avec signalement des écarts**, import des nantissements/haircuts. Composants : FinancialPortfolioUploader, PortfolioFileTypeDetector, SecuritiesColumnMapper, ImportReconciliationTable, ImportedPortfolioPreview, PortfolioImportAuditTrail.
**/imports/reconciliation** : totaux importés vs calculés (valeur, coût, PV, dette, collatéral), lignes importées/rejetées, manques (ISIN, date, coût, devise, dette), doublons, lignes à rattacher. Composants : ImportSummary, ImportErrors, ImportWarnings, ReconciliationTable, ConfirmImportButton, RollbackImportButton.

## 5. Modèle de données (TypeScript, verbatim)

```typescript
interface UBO {
  id: string;
  displayName: string;
  type: "individual" | "family" | "holding" | "trust" | "foundation" | "other";
  defaultCurrency: string;
  notes?: string;
}

interface OrganizationEntity {
  id: string;
  name: string;
  entityType: "individual" | "holding" | "company" | "fund" | "trust" | "foundation" | "bank_account" | "portfolio" | "project" | "other";
  country?: string;
  currency?: string;
  parentEntityId?: string;
  uboIds: string[];
  ownershipPercentage?: number;
}

interface PortfolioScope {
  id: string;
  name: string;
  type: "global" | "ubo" | "entity" | "bank" | "account" | "vehicle" | "project" | "asset_class" | "debt" | "leveraged_assets";
  filters: Record<string, unknown>;
}

interface Money { amount: number; currency: string; }

interface Asset {
  id: string;
  name: string;
  assetClass: AssetClass;
  subAssetClass?: string;
  uboId?: string;
  holdingEntityId: string;
  bankId?: string;
  accountId?: string;
  vehicleId?: string;
  projectId?: string;
  baseCurrency: string;
  quantity?: number;
  currentValue: Money;
  valuationDate: string;
  valuationSource: string;
  valuationConfidence?: "high" | "medium" | "low";
  acquisitionLots: AcquisitionLot[];
  cashFlows: CashFlow[];
  debtIds?: string[];
  collateralIds?: string[];
  documents?: DocumentReference[];
  taxProfile?: TaxProfile;
}

interface AcquisitionLot {
  id: string;
  assetId: string;
  tradeDate: string;
  settlementDate?: string;
  taxAcquisitionDate?: string;
  quantity?: number;
  unitPrice: Money;
  grossAmount: Money;
  fees?: Money;
  fxRateToReportingCurrency?: number;
  totalCostBasis: Money;
  financedByDebtId?: string;
  equityInvested?: Money;
  sourceDocumentId?: string;
  confidenceLevel: "high" | "medium" | "low";
  notes?: string;
}

interface CashFlow {
  id: string;
  assetId?: string;
  debtId?: string;
  date: string;
  type: "purchase" | "sale" | "dividend" | "coupon" | "distribution" | "capital_call" | "fee" | "tax" | "debt_drawdown" | "debt_repayment" | "interest_payment" | "rent" | "expense" | "valuation" | "refinancing";
  amount: Money;
  description?: string;
  sourceDocumentId?: string;
}

interface Debt {
  id: string;
  name: string;
  borrowerEntityId: string;
  uboId?: string;
  lender?: string;
  bankId?: string;
  debtType: "real_estate_amortizing" | "real_estate_bullet" | "bridge" | "lombard" | "margin_loan" | "corporate" | "shareholder_loan" | "leasing" | "private_debt" | "overdraft" | "mezzanine" | "other";
  principal: Money;
  outstandingPrincipal: Money;
  availableFacility?: Money;
  drawnAmount?: Money;
  undrawnAmount?: Money;
  startDate?: string;
  maturityDate?: string;
  interestRateType?: "fixed" | "variable";
  referenceRate?: string;
  margin?: number;
  allInRate?: number;
  amortizationType?: "bullet" | "amortizing" | "interest_only";
  monthlyPayment?: Money;
  annualInterestCost?: Money;
  linkedAssetIds?: string[];
  collateralIds?: string[];
  covenantIds?: string[];
  guaranteeIds?: string[];
  documents?: DocumentReference[];
  notes?: string;
}

interface Collateral {
  id: string;
  name: string;
  collateralType: "real_estate" | "securities_portfolio" | "cash" | "life_insurance" | "fund_units" | "shares" | "personal_guarantee" | "corporate_guarantee" | "other";
  pledgedAssetIds?: string[];
  pledgedToDebtId: string;
  pledgedToBank?: string;
  marketValue: Money;
  eligibleValue?: Money;
  haircut?: number;
  valuationDate?: string;
  valuationSource?: string;
  confidenceLevel: "high" | "medium" | "low";
}

interface Covenant {
  id: string;
  debtId: string;
  covenantType: "LTV" | "DSCR" | "ICR" | "minimum_liquidity" | "maximum_debt" | "other";
  threshold: number;
  currentValue?: number;
  status: "healthy" | "watch" | "breach" | "unknown";
  testedAt?: string;
  nextTestDate?: string;
  notes?: string;
}

interface Guarantee {
  id: string;
  debtId: string;
  guarantorEntityId?: string;
  guarantorUBOId?: string;
  guaranteeType: "personal_guarantee" | "corporate_guarantee" | "pledge" | "mortgage" | "security_interest" | "other";
  amount?: Money;
  unlimited?: boolean;
  documents?: DocumentReference[];
}

interface UnderlyingHolding {
  id: string;
  parentInstrumentId: string;
  underlyingName: string;
  underlyingTicker?: string;
  underlyingISIN?: string;
  weight: number;
  sector?: string;
  country?: string;
  currency?: string;
  source: string;
  reportingDate: string;
  confidenceLevel: "high" | "medium" | "low";
}

interface ExposureResult {
  query: string;
  exposureType: "direct" | "indirect" | "look_through" | "estimated";
  grossExposure: Money;
  netExposure?: Money;
  percentageOfNetWorth: number;
  percentageOfFinancialAssets?: number;
  breakdownByUBO: ExposureBreakdown[];
  breakdownByEntity: ExposureBreakdown[];
  breakdownByInstrument: ExposureBreakdown[];
  confidenceLevel: "high" | "medium" | "low";
  warnings: string[];
}

interface ExposureBreakdown {
  id: string;
  label: string;
  amount: Money;
  percentage: number;
  source: string;
  confidenceLevel: "high" | "medium" | "low";
}

interface ImportBatch {
  id: string;
  fileName: string;
  fileType: "real_estate_excel" | "financial_portfolio_excel" | "debt_schedule_excel" | "collateral_report" | "csv" | "pdf" | "other";
  uploadedAt: string;
  uploadedBy?: string;
  status: "uploaded" | "mapped" | "validated" | "imported" | "failed" | "rolled_back";
  detectedColumns: string[];
  mappedColumns: Record<string, string>;
  rowCount: number;
  importedRowCount: number;
  rejectedRowCount: number;
  warnings: ImportWarning[];
  errors: ImportError[];
}

interface DocumentReference {
  id: string;
  assetId?: string;
  cashFlowId?: string;
  acquisitionLotId?: string;
  debtId?: string;
  collateralId?: string;
  covenantId?: string;
  type: "purchase_agreement" | "bank_statement" | "valuation_report" | "subscription_agreement" | "capital_call" | "distribution_notice" | "tax_document" | "invoice" | "loan_agreement" | "lombard_agreement" | "mortgage_deed" | "pledge_agreement" | "covenant_certificate" | "amortization_schedule" | "term_sheet" | "other";
  fileName: string;
  uploadedAt: string;
  documentDate?: string;
  source?: string;
}

interface AuditTrailEntry {
  id: string;
  entityType: "asset" | "lot" | "cashflow" | "valuation" | "debt" | "collateral" | "covenant" | "document" | "import";
  entityId: string;
  action: "created" | "updated" | "deleted" | "verified" | "imported" | "rolled_back";
  changedBy?: string;
  changedAt: string;
  previousValue?: unknown;
  newValue?: unknown;
  comment?: string;
}

interface TaxProfile {
  regime?: "PFU" | "barème" | "IS" | "real_estate_capital_gain" | "other";
  country?: string;
  taxEntity?: string;
  estimatedTaxRate?: number;
  notes?: string;
  certaintyLevel: "high" | "medium" | "low";
}
```

## 6. Calculs financiers — `src/lib/finance/calculations.ts`

33 fonctions : calculateCostBasis, calculateCurrentValue, calculateGrossAssetValue, calculateNetAssetValue, calculateUnrealizedGain, calculateUnrealizedGainNetOfDebt, calculateUnrealizedGainPercent, calculateRealizedGain, calculateIncomeReceived, calculateTotalReturn, calculateLeveredReturn, calculateAnnualizedReturn, calculateIRR (XIRR), calculateLeveredIRR, calculateMOIC, calculateEquityMultiple, calculateLTV, calculateGlobalLTV, calculateDebtService, calculateAnnualInterestCost, calculateWeightedAverageCostOfDebt, calculateDebtMaturitySchedule, calculateCollateralCoverage, calculateLombardLTV, calculateMarginCallDistance, calculateStressedLTV, calculateCovenantStatus, calculateNetEquityValue, calculatePortfolioAllocation, calculateDataQualityStatus, calculateTaxIndicativeGain, calculatePortfolioNetWorth, calculatePortfolioDebt.

Définitions :
1. Prix de revient = Σ prix d'achat + frais d'acquisition + frais capitalisés + travaux capitalisés + frais de change.
2. Valeur actuelle brute = valeur de marché / NAV / expertise / manuelle selon classe.
3. Valeur nette de dette = valeur brute − dette rattachée.
4. Equity investie = prix de revient − dette de financement initiale.
5. PV latente brute = valeur brute − prix de revient.
6. PV latente nette de dette = valeur nette de dette − equity investie.
7. PV latente % = PV latente / prix de revient restant.
8. PV réalisée = produits de cession − coût des lots vendus (FIFO / PMP / manuel).
9. Revenus encaissés = dividendes + coupons + loyers nets + distributions.
10. Performance totale = PV latente + PV réalisée + revenus − frais non capitalisés.
11. Performance nette de dette = après intérêts, frais financiers et remboursements.
12. TRI = XIRR des flux datés, valeur actuelle en flux terminal.
13. TRI net de dette = XIRR sur flux equity après dette.
14. MOIC = (valeur actuelle + distributions) / capital investi.
15. Equity multiple = (valeur nette de dette + distributions) / equity investi.
16. LTV = dette restante / valeur brute.
17. Coût moyen pondéré = Σ taux all-in pondérés par CRD.
18. Collateral coverage = valeur éligible du collatéral / dette tirée.

Cas particuliers — coté : FIFO/PMP/manuel, lots multiples, devises, frais, dates fiscales, titres nantis, haircuts. Fonds : commitment, called/uncalled, distributions, NAV, DPI/RVPI/TVPI, IRR, MOIC, dette de souscription. Immobilier : prix de revient complet, CRD, LTV, equity value, loyers/charges/NOI, cash-flow, rendements, TRI, DSCR.

**Tests unitaires obligatoires** pour tous les calculs (y compris dette, Lombard, stress tests).

## 7. Moteur d'exposition

Fonctions : calculateDirectExposure, calculateIndirectExposure, calculateLookThroughExposure, calculateExposureByUBO/Entity/Instrument, calculateDebtExposure, calculateCollateralExposure, calculateRateExposure, calculateCurrencyExposure, calculateExposureConfidence, normalizeExposureQuery, matchExposureTarget, matchUnderlyingHolding. Recherche par ticker, nom, ISIN, holdings directs, sous-jacents ETF/fonds, secteurs, benchmarks. Sépare : direct certain / indirect certain / indirect estimé / non calculable.

## 8. Data quality

Règles : initialPurchaseDate absent → warning · costBasis absent → **critical** · valo ancienne → warning · source absente → warning · document absent → warning · currency absente → **critical** · holdingEntity absente → **critical** · UBO absent → param · currentValue absent → **critical** · dette non rattachée / sans maturité / sans taux / sans prêteur / sans document → warning · Lombard sans collatéral → **critical** · collatéral sans valo → warning · covenant sans seuil → warning · flux non catégorisé → warning · doublon probable → warning · import non réconcilié → warning. Composants : DataQualityBadge, DataQualityPanel, PortfolioDataQualitySummary, DebtDataQualitySummary, LeverageRiskSummary + `getDataQualityIssues(asset)`, `getDebtQualityIssues(debt)`.

## 9. Contraintes techniques

TypeScript strict (pas de `any` non justifié), composants réutilisables, Tailwind propre, Recharts, ne pas casser l'existant, tests unitaires sur les calculs, mock data réalistes, compilation vérifiée. Chaque graphique répond à une question financière précise — aucun graphique décoratif.

## 10. Ordre d'implémentation prioritaire

1. Analyser le repo → 2. Plan technique → 3. Modèle UBO/organisation → 4. PortfolioScope + OrganizationSwitcher → 5. Adapter tous les écrans au scope → 6. Modèles Asset/Lot/CashFlow/Debt/Collateral/Covenant/Guarantee/Document → 7. Calculs financiers → 8. Calculs dette/LTV/Lombard/covenants/stress → 9. Tests → 10. Dashboard → 11. Table portefeuille → 12. PV latentes → 13. Acquisition Ledger → 14. Fiche actif → 15. Dette & Levier → 16. Module Lombard → 17. Moteur d'exposition → 18. Vue Exposure → 19. Look-through → 20. Import Excel immo → 21. Import portefeuille financier → 22. Import dette/collatéral → 23. Réconciliation → 24. Data quality → 25. Documents + audit trail → 26. Rollback d'import → 27. Mobile → 28. Polish UI → 29. Compilation + tests.
