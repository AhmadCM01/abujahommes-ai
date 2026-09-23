# AbujaHommes AI — Ground Truth Listing Shape Inventory (Phase A)

**Generated:** September 14, 2026  
**Product:** AbujaHommes AI (Abuja Property Intelligence Platform)  
**Scope:** Phase A complete inventory of listing entities, types, UI components, ML integration points, geography, and relations across the codebase.

---

## 1. `SEED_LISTINGS` & `memoryListings` Field-by-Field Inventory

The in-memory data store in `src/app/api/listings/route.ts` initializes from `SEED_LISTINGS` in `src/lib/data/seedListings.ts`. Every single key in use is detailed below:

| Field Name | Type | Required / Optional | Example Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | Required | `'prop-1'`, `'prop-1726300000000'` | Primary identifier. Format: `prop-<id>` or timestamp. |
| `seller_id` | `string` | Required | `'seller-mshel'`, `'seller-bilaad'`, `'user-uuid'` | References listing creator (`profiles.id` / `owner_id`). |
| `seller_name` | `string` | Optional | `'Mshel Homes (Verified Developer)'` | Display name of seller or developer agency. |
| `seller_phone` | `string` | Optional | `'+234 809 000 6743'` | Contact phone number in Nigerian format. |
| `seller_verified` | `boolean` | Optional | `true` | Badge indicating developer/agent identity verification. |
| `title` | `string` | Required | `'Mshel Ophelia — 6-Bedroom Smart Luxury Detached Mansion'` | Listing headline title. |
| `property_type` | `PropertyType` | Required | `'detached'`, `'duplex'`, `'flat'`, `'terrace'`, `'bungalow'` | Property category enum (see Section 3). |
| `transaction_type` | `TransactionType`| Required | `'sale'`, `'rent'` | Listing type: outright sale or annual lease. |
| `lga` | `LGA` | Required | `'AMAC'`, `'Bwari'` | Abuja Area Council (one of 6 FCT councils). |
| `location` | `string` | Required | `'Maitama'`, `'Guzape'`, `'Gwarinpa'`, `'Kubwa'` | Specific Abuja district or neighborhood name. |
| `address` | `string` | Optional | `'Gana Street / Mississippi Corridor, Maitama Phase 1'` | Street address or prominent landmark. |
| `market_tier` | `MarketTier` | Optional | `'Premium'`, `'Prime'`, `'Mid'`, `'Emerging'`, `'Outer'`, `'Rural'` | Abuja market valuation tier computed from location. |
| `bedrooms` | `number` | Required | `6`, `3`, `0` | Number of bedrooms (`0` for studio or land). |
| `bathrooms` | `number` | Required | `7`, `3` | Number of bathrooms. |
| `asking_price` | `number` | Required | `680000000`, `7500000` | Price in integer Nigerian Naira (NGN). |
| `ai_price_estimate` | `number` | Optional | `665000000` | AI point valuation estimate in integer NGN. |
| `ai_price_min` | `number` | Optional | `630000000` | Lower bound of fair price range in integer NGN. |
| `ai_price_max` | `number` | Optional | `710000000` | Upper bound of fair price range in integer NGN. |
| `price_confidence` | `PriceConfidence`| Optional | `'high'`, `'medium'`, `'low'` | Algorithmic valuation confidence level. |
| `description` | `string` | Required | `'Direct from developer Mshel Homes: Ultra-luxury...'` | Markdown or plaintext property narrative. |
| `title_type` | `TitleType` | Required | `'C of O'`, `'FCDA Allocation'`, `'FHA Allocation'` | Statutory title document (see Section 3). |
| `amenities` | `string[]` | Required | `['Swimming Pool', 'Security / CCTV', 'Generator']` | Array of amenity names from approved Abuja amenity set. |
| `images` | `string[]` | Required | `['https://images.unsplash.com/...']` | Array of image URLs (index 0 is cover photo). |
| `status` | `ListingStatus` | Required | `'active'`, `'pending'`, `'paused'`, `'sold'`, `'rejected'` | Publication and moderation status. |
| `fraud_score` | `number` | Required | `5`, `85` | AI/rule safety score from 0 (safe) to 100 (critical risk). |
| `fraud_risk_level` | `FraudRiskLevel`| Required | `'low'`, `'medium'`, `'high'`, `'critical'` | Risk level bucket corresponding to fraud score. |
| `fraud_red_flags` | `string[]` | Optional | `['Asking price is significantly below market valuation']` | Identified risk flags and discrepancy warnings. |
| `fraud_recommendation`| `string` | Optional | `'Safe to proceed — Verified developer title'` | Clear recommendation guidance for prospective buyers. |
| `views` | `number` | Required | `1420`, `0` | Cumulative count of listing detail views. |
| `saves` | `number` | Required | `168`, `0` | Cumulative count of buyer saves / bookmarks. |
| `enquiries` | `number` | Required | `24`, `0` | Cumulative count of direct enquiries dispatched. |
| `data_source` | `string` | Optional | `'seller_submitted'`, `'verified_developer'`, `'verified_agency'` | Source origin of listing data. |
| `rejection_reason` | `string` | Optional | `null` | Admin explanation if listing moderation was rejected. |
| `created_at` | `string` | Required | `'2025-08-01T10:00:00Z'` | ISO 8601 creation timestamp. |
| `updated_at` | `string` | Required | `'2025-08-10T12:00:00Z'` | ISO 8601 last update timestamp. |

---

## 2. Listing UI Forms, Views & Cards

### A. Create Listing Form (`src/app/dashboard/seller/new-listing/page.tsx`)
A 5-step wizard capturing:
1. **Step 1: Basics**
   - `transactionType`: `rent` | `sale` (toggle buttons: "For Rent / Lease" vs "For Outright Sale")
   - `propertyType`: 5 prominent category buttons (`detached`, `semi-detached`, `flat`, `land`, `commercial`)
   - `lga`: Select dropdown (`AMAC`, `Bwari`, `Gwagwalada`, `Kuje`, `Kwali`, `Abaji`)
   - `location`: Datalist text input powered by `POPULAR_LOCATIONS` (e.g. Maitama, Wuse 2, Gwarinpa, Kubwa)
   - `address`: Street address or landmark (optional)
2. **Step 2: Details**
   - `title`: Headline string (e.g. "Contemporary 4-Bedroom Semi-Detached Duplex")
   - `bedrooms`: Stepper integer (0 to 20)
   - `bathrooms`: Stepper integer (0 to 20)
   - `titleType`: Select dropdown (`C of O`, `Right of Occupancy`, `Governors Consent`, `Deed of Assignment`, `Survey`, `Other`)
   - `landSize`: SQM numeric input (captured in UI state)
   - `selectedAmenities`: Multi-select checkboxes from `ALL_AMENITIES` (12 amenities)
   - `description`: Textarea with character counter (minimum 80 characters required)
3. **Step 3: Pricing & AI Valuation**
   - `askingPrice`: NGN integer naira input
   - Visual market fair zone comparison against calculated district min/max bounds
4. **Step 4: Photos**
   - `photos`: Array of image URLs (up to 10 photos; slot 0 marked as "Cover")
5. **Step 5: Review & Safety Pre-Check**
   - Summary verification card
   - Automated safety pre-check badge ("Safety Pre-Check Passed")
   - `confirmedAccurate`: Legal confirmation checkbox
   - Submit action calling `POST /api/listings` (submits with status `'pending'`)

### B. Manage Listings View (`src/app/dashboard/seller/listings/page.tsx`)
- Status tabs: `All Listings`, `Active`, `Paused`, `Pending Review`
- Action controls: Toggle Pause/Activate (`PATCH status`), View Details, Delete (`DELETE /api/listings/[id]`)
- Engagement metrics displayed: Views, Saves, Enquiries

### C. Detail Page (`src/app/dashboard/buyer/property/[id]/page.tsx`)
- High-resolution cover photo and thumbnail carousel
- Core badges: `market_tier`, `price_confidence` chip, `LGA Council`
- Pricing: Formatted asking price (`formatNGN`), `/year` suffix for rent, `PriceRangeDisplay` (`ai_price_min` to `ai_price_max`)
- Specs grid: Bedrooms, Bathrooms, Council, Title
- Location coordinates & Google Maps outbound link
- Safety & Fraud Analysis Card:
  - `fraud_score` progress bar (0–100) with risk variant styling
  - `fraud_risk_level` badge (`low`, `medium`, `high`, `critical`)
  - `fraud_red_flags` bulleted warning box
  - `fraud_recommendation` chip
  - Explanatory collapsible toggle ("How is safety scored?")
- Amenities checklist (12 items with check/strikethrough styling)
- AI Property Intelligence Breakdown (Price Assessment, Investment Potential, Title Security, Corridor Growth)
- Sidebar:
  - Seller card with verification badge
  - Direct live chat CTA
  - Direct message enquiry form (message + buyer phone)
  - Cost & fee calculator (base price + 5-10% agency fee + 3-5% legal fee + 1.5% stamp duty for sales)
  - Similar nearby properties grid

### D. Search & Filter Components (`src/components/search/`)
- `NLPSearchBar.tsx`: Dual-mode search input supporting natural Pidgin ("I dey find 3 bedroom flat for Gwarinpa under 3m") and English, querying `POST /api/nlp-search`.
- `SearchFilters.tsx`: Comprehensive filter drawer with:
  - LGA select
  - Location text input
  - Property category buttons
  - Price slider & inputs (NGN 0 to NGN 500M)
  - Title type select
  - Amenity checkboxes
  - Fraud risk filter (`low`, `medium`, `any`)
  - Sort select (`relevance`, `price_asc`, `price_desc`, `newest`, `most_saved`)

### E. Property Cards (`src/components/property/PropertyCard.tsx`)
- Cover photo with LGA and transaction tags
- Heart button for instant favourite toggle via `useSearchStore`
- Formatted price with `/year` suffix for rent
- `PriceRangeDisplay` showing AI fair bounds
- Title & details chips: Bedrooms, Bathrooms, Property Type, Title Document
- Full-width `FraudScoreChip`
- Direct action buttons: "View Details" and "Send Enquiry" modal trigger

### F. Admin Moderation & Fraud Center
- `src/app/dashboard/admin/listings/page.tsx`: Full registry table, bulk approval, deletion.
- `src/app/dashboard/admin/fraud/page.tsx`: Quarantine center for listings with `fraud_score > 40`, seller account freeze actions, EFCC/REDAN audit export.

---

## 3. Existing TypeScript Types & Data Schemas

Defined across `src/types/property.ts`, `src/types/notification.ts`, and `src/types/index.ts`:

```typescript
// Property category (Abuja-specific housing types)
export type PropertyType =
  | 'detached'
  | 'semi-detached'
  | 'flat'
  | 'terrace'
  | 'bungalow'
  | 'duplex'
  | 'land'
  | 'commercial'

// Transaction type
export type TransactionType = 'rent' | 'sale'

// Abuja Local Government Areas (6 Area Councils)
export type LGA = 'AMAC' | 'Bwari' | 'Gwagwalada' | 'Kuje' | 'Kwali' | 'Abaji'

// Abuja Market Tiers
export type MarketTier = 'Premium' | 'Prime' | 'Mid' | 'Emerging' | 'Outer' | 'Rural'

// Statutory Nigerian Title Documents
export type TitleType =
  | 'C of O'
  | 'Right of Occupancy'
  | 'Deed of Assignment'
  | 'Governors Consent'
  | 'FCDA Allocation'
  | 'FHA Allocation'
  | 'Survey'
  | 'Other'

// AI Confidence levels
export type PriceConfidence = 'high' | 'medium' | 'low'

// Algorithmic fraud risk brackets
export type FraudRiskLevel = 'low' | 'medium' | 'high' | 'critical'

// Listing lifecycle statuses
export type ListingStatus = 'pending' | 'active' | 'rejected' | 'paused' | 'sold'
```

Approved Abuja Amenities (`ALL_AMENITIES` from `src/lib/data/premiums.ts`):
1. `Swimming Pool` (score: 15)
2. `Gym` (score: 12)
3. `Security / CCTV` (score: 10)
4. `Generator` (score: 10)
5. `Water / Borehole` (score: 8)
6. `Boys Quarters` (score: 8)
7. `Solar Power` (score: 7)
8. `Fibre Internet` (score: 6)
9. `Parking Space` (score: 6)
10. `Air Conditioning` (score: 5)
11. `Perimeter Fence` (score: 5)
12. `DSTV / Cable` (score: 3)

Title Valuation Multipliers (`titlePremium` in `src/lib/data/premiums.ts`):
- `C of O`: 1.50
- `Governors Consent`: 1.35
- `Right of Occupancy`: 1.20
- `FCDA Allocation`: 1.15
- `FHA Allocation`: 1.10
- `Deed of Assignment`: 1.10
- `Survey`: 1.05
- `Other`: 1.00

---

## 4. Price Prediction & Fraud Scoring Workflows

### A. Price Prediction Engine
- **Endpoint:** `POST /api/price-predict`
- **External ML Microservice:**
  - Service URL: `process.env.ML_SERVICE_URL` (local: `http://localhost:8000`)
  - Target Path: `POST /predict`
  - Microservice Implementation: FastAPI application in `ml-service/main.py`
  - Payload Sent:
    ```json
    {
      "lga": "AMAC",
      "location": "Maitama",
      "property_type": "detached",
      "transaction_type": "sale",
      "bedrooms": 6,
      "bathrooms": 7,
      "title_type": "C of O",
      "amenities": ["Swimming Pool", "Generator"],
      "market_tier": "Premium"
    }
    ```
  - ML Features Extracted:
    - `LGA_ENCODING`: AMAC=0, Bwari=1, Gwagwalada=2, Kuje=3, Kwali=4, Abaji=5
    - `TIER_ENCODING`: Premium=5, Prime=4, Mid=3, Emerging=2, Outer=1, Rural=0
    - `PROPERTY_TYPE_ENCODING`: detached=0, semi-detached=1, flat=2, land=3, commercial=4
    - `transaction_type`: 1 for sale, 0 for rent
    - `bedrooms`, `bathrooms`
    - `title_premium`: Float multiplier
    - `amenity_score`: Sum of amenity weights
  - Response Schema:
    ```json
    {
      "predicted_price": 665000000,
      "min_price": 630000000,
      "max_price": 710000000,
      "confidence": "high",
      "model_version": "abujahommes-reg-v2.1",
      "training_records": 4820,
      "data_freshness": "Updated July 2025"
    }
    ```
- **Statistical Fallback (when ML is offline or times out after 3s):**
  - Uses `calculateBasePrice` from `src/lib/data/enrich.ts`
  - Annual rent baseline by tier:
    - Premium: NGN 6,500,000
    - Prime: NGN 4,000,000
    - Mid: NGN 2,200,000
    - Emerging: NGN 1,000,000
    - Outer: NGN 600,000
    - Rural: NGN 250,000
  - Scaled by property type multiplier (1.0x to 1.6x), bedroom count, 45x multiplier for outright sales, statutory title multiplier (1.0x to 1.5x), and amenity scores.
  - Min / Max bounds computed as `-15%` / `+15%` of estimate.
- **Where UI Displays Price Prediction:**
  - `PropertyCard`: In `PriceRangeDisplay` ("Fair: NGN X – NGN Y") and `ConfidenceChip`.
  - `PropertyDetailPage`: In hero price header, `PriceRangeDisplay`, and fee calculator.
  - `NewListingPage` (Step 3): In "AI Fair Market Valuation" zone visualizer.

### B. Fraud Scoring Engine
- **Endpoint:** `POST /api/fraud-score`
- **Primary Evaluator:** Google Gemini `gemini-2.0-flash` (via `@google/generative-ai` with `process.env.GEMINI_API_KEY`).
  - Payload: `{ listing, marketAverage, marketMin, marketMax }`
  - Returns JSON: `{ fraudScore, riskLevel, redFlags, recommendation, analysis }`
- **Rule-Based Fallback Evaluator:**
  - Evaluates 4 risk vectors:
    1. *Price Outlier:* Price `< 0.55 * median` (+45 points) or `> 2.2 * median` (+25 points)
    2. *Pressure / Urgent Language:* Detection of scam keywords (`urgent`, `relocating abroad`, `travelling abroad`, `transfer first`, `deposit first`, `no agents`) (+35 points)
    3. *Title Defects:* No recognized statutory title or `Other` (+20 points)
    4. *Description Length:* Less than 25 words (+15 points)
  - Scoring Brackets:
    - Score `> 75`: `critical` risk ("Do not proceed — high fraud risk")
    - Score `> 55`: `high` risk ("Verify title and owner identity before payment")
    - Score `> 30`: `medium` risk ("Proceed with caution")
    - Score `<= 30`: `low` risk ("Safe to proceed")
- **Creation-Time Pre-Scoring:**
  - Executed inside `POST /api/listings` (lines 81–87). If `asking_price < 0.5 * priceCalc.min`, assigns `fraudScore = 85`, `fraud_risk_level = 'critical'`.
- **Where UI Displays Fraud Score:**
  - `PropertyCard`: Full-width `FraudScoreChip` displaying score number and color-coded risk badge.
  - `PropertyDetailPage`: Dedicated "Listing Safety & Title Analysis" card with numeric score, progress bar, red flags alert box, and recommendation.
  - `AdminFraudAlertsPage`: Real-time quarantine center displaying listings with `fraud_score > 40`.

---

## 5. Favourites, Saved Searches & Enquiries Inventory

### A. Favourites
- **Exists in UI:** Yes.
  - `src/components/property/PropertyCard.tsx`: Interactive heart button toggling save state via `useSearchStore.getState().toggleSaveListing(id)`.
  - `src/app/dashboard/buyer/property/[id]/page.tsx`: Header heart button.
  - `src/app/dashboard/buyer/favourites/page.tsx`: Dedicated buyer dashboard page displaying all saved listings with property category tabs and sorting.
- **Exists in Existing Schema:** Yes.
  - `supabase/schema.sql` (lines 181–187):
    ```sql
    CREATE TABLE IF NOT EXISTS favourites (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, listing_id)
    );
    ```
  - *Adjustment for Phase B:* `user_id` must reference `profiles(id)` as `TEXT`, and `listing_id` must match `listings.id`.

### B. Saved Searches
- **Exists in UI:** Yes.
  - `src/app/dashboard/buyer/saved-searches/page.tsx`: Table listing saved searches with query criteria, result counts, live alert switch toggle, and "Run" button.
- **Exists in TypeScript Types:** Yes.
  - `SavedSearch` in `src/types/notification.ts`:
    ```typescript
    export interface SavedSearch {
      id: string
      user_id: string
      name: string
      query_text?: string
      filters?: Record<string, unknown>
      result_count: number
      alert_enabled: boolean
      last_run?: string
      created_at: string
    }
    ```
- **Exists in Existing Schema:** Yes.
  - `supabase/schema.sql` (lines 168–178):
    ```sql
    CREATE TABLE IF NOT EXISTS saved_searches (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      query_text TEXT,
      filters JSONB,
      result_count INT DEFAULT 0,
      alert_enabled BOOLEAN DEFAULT false,
      last_run TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```

### C. Enquiries
- **Exists in UI:** Yes.
  - Direct inquiry modal on `PropertyCard.tsx` (opens modal with buyer message and phone input).
  - Direct inquiry sidebar form on `PropertyDetailPage` (`src/app/dashboard/buyer/property/[id]/page.tsx`).
- **Exists in TypeScript Types:** Yes.
  - `Enquiry` in `src/types/notification.ts`:
    ```typescript
    export interface Enquiry {
      id: string
      listing_id: string
      buyer_id: string
      seller_id: string
      message: string
      buyer_name?: string
      buyer_phone?: string
      buyer_email?: string
      listing_title?: string
      status: 'new' | 'read' | 'replied' | 'closed'
      created_at: string
    }
    ```
- **Exists in Existing Schema:** Yes.
  - `supabase/schema.sql` (lines 236–246):
    ```sql
    CREATE TABLE IF NOT EXISTS enquiries (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
      buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      buyer_phone TEXT,
      buyer_email TEXT,
      status TEXT DEFAULT 'new' CHECK (status IN ('new','read','replied','closed')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```

---

## 6. Neighborhood, LGA & District Geography Values

Abuja geography is defined in `src/lib/data/locations.ts`. It strictly covers the Federal Capital Territory (FCT):

### A. The 6 Area Councils (LGAs)
1. `AMAC` (Abuja Municipal Area Council — central urban districts and phase 1–4 developments)
2. `Bwari` (Bwari Area Council — northern satellite towns including Kubwa, Dawaki, Dutse, Ushafa)
3. `Gwagwalada` (Gwagwalada Area Council — university and transit corridor)
4. `Kuje` (Kuje Area Council — south-central agricultural and residential expansion zone)
5. `Kwali` (Kwali Area Council — southern agricultural zone and SHESTCO research park)
6. `Abaji` (Abaji Area Council — southern historic gateway city)

### B. Cataloged Districts and Neighborhoods (133+ records)
Mapped to market tiers in `ABUJA_LOCATIONS`:
- **Premium Tier:** Maitama, Asokoro, Wuse 2, Central Business District (CBD), Guzape, Diplomatic Zone, Three Arms Zone.
- **Prime Tier:** Jabi, Utako, Mabushi, Katampe Extension, Wuye, Garki 1, Garki 2, Apo Legislative Quarters, Centenary City Corridor.
- **Mid Tier:** Gwarinpa (and 1st through 7th Avenues), Katampe, Jahi, Kado, Durumi, Gudu, Kaura, Life Camp, Apo, Sun City Estate, Sunnyvale Estate, Games Village, River Park Estate.
- **Emerging Tier:** Lokogoma, Galadimawa, Lugbe, Airport Road Corridor, Karmo, Dape, Dawaki, Dutse, Mpape, Trademore Estate.
- **Outer Tier:** Kubwa (Phases 1–4, PW, Arab Road, FHA, Brick City), Karu, Nyanya, Jikwoyi, Kurudu, Bwari Central, Gwagwalada Central, Zuba, Kuje Town, Pegi.
- **Rural Tier:** Ushafa, Kwaku, Rubochi, Kwali Central, Sheda, Yangoji, Abaji Central, Yaba.

### C. Normalization & Aliases
`locationAliases` in `src/lib/data/clean.ts` maps colloquial inputs (e.g. `'wuse ii'` -> `'Wuse 2'`, `'garki'` -> `'Garki 1'`, `'cbd'` -> `'Central Business District'`).

---

## 7. Product Alignment & Validation Checklist

- [x] **Currency:** Integer Nigerian Naira (`NGN`), formatted with commas and compact `M`/`B`/`k` notation in `src/lib/utils.ts`. No kobo fractional decimals used in the UI. SQL column: `BIGINT`.
- [x] **Location:** Strictly FCT Abuja — Area Councils (`AMAC`, `Bwari`, etc.), districts, and specific estates.
- [x] **Transaction:** Strictly `sale` or `rent`.
- [x] **Property Types:** Strictly Nigerian market types (`detached`, `semi-detached`, `flat`, `terrace`, `bungalow`, `duplex`, `land`, `commercial`). No US ranch/condo/HOA conventions.
- [x] **Title Types:** Statutory Nigerian documents (`C of O`, `Right of Occupancy`, `Governors Consent`, `Deed of Assignment`, `FCDA Allocation`, `FHA Allocation`, `Survey`, `Other`).
- [x] **Intelligence Columns:** Min/max price estimates, confidence level, fraud score (0–100), red flags array/json, last scored/valued timestamps.
- [x] **Ownership:** Listings tied to `owner_id TEXT REFERENCES profiles(id)`.
- [x] **Status:** Matches application UI lifecycle (`pending`, `active`, `paused`, `sold`, `rejected`).
- [x] **Auxiliary Entities:** Favourites, Saved Searches, Media, and Enquiries existing in both UI and data contracts.
