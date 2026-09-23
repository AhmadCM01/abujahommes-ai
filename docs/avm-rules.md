# AbujaHommes AI — Automated Valuation Model (AVM) & Fair-Price Honesty Rules

## 1. Executive Summary

This document defines the rules, scaling multipliers, fallback mechanics, and UI suppression policies governing property valuations across AbujaHommes AI. The core objective is **algorithmic honesty**: never present a fair price band that is contradictory, deceptive, or detached from reality relative to the property's `asking_price` or `transaction_type`. If an automated valuation range is unreliable or anomalous, the system **cleanly suppresses the band** rather than displaying nonsense ranges to buyers.

---

## 2. Currency Units & Precision

- **Standard Currency**: Nigerian Naira (NGN, ₦).
- **Data Types**:
  - PostgreSQL: `BIGINT` (`asking_price`, `ai_price_estimate`, `ai_price_min`, `ai_price_max`, `predicted_price_min`, `predicted_price_max`).
  - TypeScript: `number` (strictly rounded integers, e.g. `Math.round(price)`).
  - Python (FastAPI): `int` (e.g. `int(predicted)`).
- **Sub-unit rule**: No fractional Naira (kobo) or floating-point currency values are persisted or displayed.

---

## 3. Rent vs. Sale Scaling: The 45x Multiplier

### 3.1 Valuation Foundations
Valuation begins from district annual rent medians established by market tier:
- **Premium** (Maitama, Asokoro, Guzape): ₦6,500,000 / year base
- **Prime** (Wuse 2, Jabi, Utako, Katampe Extension): ₦4,000,000 / year base
- **Mid** (Gwarinpa, Mabushi, Life Camp, Wuye): ₦2,200,000 / year base
- **Emerging** (Kubwa, Lugbe, Lokogoma, Dawaki): ₦1,000,000 – ₦1,100,000 / year base
- **Outer** (Kuje, Bwari, Karu, Mpape): ₦600,000 / year base
- **Rural** (Abaji, Kwali, Rubochi): ₦250,000 / year base

### 3.2 The 45x Sale Multiplier
In Abuja's formal residential market, gross annual rental yields range between **2.0% and 3.0%** (i.e. Price-to-Rent ratio of approximately 35x to 50x annual rent).
- In `src/lib/data/enrich.ts` (`calculateBasePrice`):
  ```typescript
  if (transactionType === 'sale') {
    // Abuja sale multiples range between 35x to 60x annual rent
    base *= 45;
  }
  ```
- In `ml-service/main.py` (`fallback_estimate`) and `ml-service/train.py`:
  ```python
  if req.transaction_type == 'sale':
      base = base * 45  # Abuja sale multiple
  ```
- For `transaction_type = 'rent'`, the multiplier is strictly **1.0x** (annual rent).
- For `transaction_type = 'sale'`, the multiplier is **45.0x** (capital acquisition value).

---

## 4. ML Service vs. Statistical Fallback Engine

### 4.1 Orchestration Flow
When a valuation is requested via `POST /api/price-predict`:
1. **Python ML Service** (`POST ${ML_SERVICE_URL}/predict`):
   - Invoked if `ML_SERVICE_URL` is set and reachable with a strict **3000ms timeout** (`AbortSignal.timeout(3000)`).
   - Runs a Random Forest Regressor trained on normalized Abuja housing attributes.
2. **TypeScript Statistical Regression Fallback** (`calculateBasePrice` in `src/lib/data/enrich.ts`):
   - Triggered when `ML_SERVICE_URL` is missing, offline, returns a 5xx error, or times out.
   - Applies deterministic district-tier base rates, property-type multipliers, bedroom adjustments, title deed premiums, and amenity scores.

### 4.2 Fallback Confidence Rule
- **Statistical fallback predictions must NEVER be assigned `'high'` confidence.**
- Fallback predictions are assigned `confidence: 'medium'` (or `'low'` if input parameters are incomplete or anomalous). High confidence is reserved strictly for ML predictions supported by sufficient market training density.

---

## 5. Root-Cause Analysis of Historic Anomalies

### 5.1 Case A: Asking ₦2.5M with band ₦39M–₦53M (`prop-1789640274621`)
- **What happened**: A listing titled *"Spacious 3-Bedroom Serviced Apartment"* in Kuje Town was entered with an asking price of ₦2,500,000. In Abuja, ₦2.5M is a typical annual rental price. However, the listing's `transaction_type` was erroneously saved as `'sale'`.
- **The cascade**: The AVM engine received `transaction_type = 'sale'` and multiplied the baseline by 45x. This computed a sale estimate of ₦46,224,000 with a band of ₦39.3M–₦53.2M.
- **The failure**: The creation routine hardcoded `price_confidence: 'high'` and saved the band. The buyer card displayed an asking price of ₦2,500,000 alongside a fair band of ₦39,290,400–₦53,157,600 with "High AI Confidence".

### 5.2 Case B: Asking ₦350M with band ₦808M–₦1.09B (`prop-1789642523736`)
- **What happened**: A 4-bedroom duplex with BQ in Maitama was listed for sale at ₦350,000,000.
- **The cascade**: The statistical formula for Premium tier Maitama (₦6.5M rent base × 1.25 duplex × 1.4 bedroom multiplier × 1.5 C of O × 45 sale multiplier × amenities) calculated an AI estimate of ₦951,234,375 (min ₦808.5M, max ₦1.09B).
- **The failure**: Because ₦350M was < 50% of the calculated minimum, the listing was flagged as `critical` fraud risk (score 85). However, `createListingRecord` still inserted `price_confidence: 'high'`, resulting in contradictory buyer signals: a critical risk flag alongside a confident fair range that was 2.5x higher than the seller's asking price.

---

## 6. AVM Sanity & Suppression Rules

### 6.1 Creation & Valuation Rules (`src/lib/db/listings.ts`)
1. **Strict Transaction-Scale Alignment**:
   - `transaction_type === 'rent'` → Fair band must be in the annual rent scale (1x).
   - `transaction_type === 'sale'` → Fair band must be in the sale scale (45x).
2. **Price Sanity Bounds**:
   - Let `min = priceCalc.min` and `max = priceCalc.max`.
   - If `asking_price < 0.5 * min` OR `asking_price > 2.0 * max`:
     - The listing asking price deviates excessively from calculated norms.
     - `price_confidence` is automatically set to `'low'`.
   - If `fraud_risk_level === 'high'` or `fraud_risk_level === 'critical'`:
     - `price_confidence` is never `'high'`; it is downgraded to `'low'`.
   - Only listings with `marketTier` in `['Premium', 'Prime']`, prices within `[0.75 * min, 1.25 * max]`, and `fraud_risk_level === 'low'` may receive `price_confidence = 'high'`.

### 6.2 Buyer Display Suppression Rules (`PriceRangeDisplay.tsx`)
The fair range (`Fair range: ₦X – ₦Y`) is completely **suppressed (hidden)** from all buyer-facing views (`PropertyCard`, Search Grid, Property Detail hero/header) when ANY of the following conditions are met:
1. `minPrice` or `maxPrice` is missing, null, undefined, or `<= 0`.
2. `confidence === 'low'`.
3. `fraudRiskLevel === 'high'` or `fraudRiskLevel === 'critical'`.
4. `askingPrice < 0.5 * minPrice` OR `askingPrice > 2.0 * maxPrice`.

When suppressed, the UI displays **only the honest asking price**, with no misleading "Fair: X–Y" band.

---

## 7. Optional SQL Commands for Historical Row Correction

If you wish to manually align historical listings where `transaction_type` or valuation bounds were recorded incorrectly, execute the following in PostgreSQL:

```sql
-- Fix prop-1789640274621: Correct transaction_type to 'rent' and reset AI band to rent scale
UPDATE listings
SET 
  transaction_type = 'rent',
  ai_price_estimate = 2742667,
  ai_price_min = 2331267,
  ai_price_max = 3154067,
  price_confidence = 'high',
  fraud_score = 10,
  fraud_risk_level = 'low',
  fraud_red_flags = '{}'
WHERE id = 'prop-1789640274621';

-- Fix prop-1789642523736: Suppress AI band for anomalous ₦350M Maitama duplex
UPDATE listings
SET 
  price_confidence = 'low',
  predicted_confidence = 'low'
WHERE id = 'prop-1789642523736';

-- Optional: Fix prop-slice3-chat-test-01 property_type from 'duplex' to 'detached'
UPDATE listings
SET property_type = 'detached'
WHERE id = 'prop-slice3-chat-test-01';
```
