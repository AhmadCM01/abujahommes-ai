# AbujaHommes AI - Search Sources & Catalog Inventory Audit

This document audits every search and catalog surface across AbujaHommes AI following the completion of Slice 2. All live user catalog surfaces read directly from PostgreSQL via `GET /api/listings`. `SEED_LISTINGS` remains strictly on disk as an archival reference and ML regression comparative baseline; it is not served as the live catalog on any user surface.

---

## 1. Catalog Surface Summary

| # | Surface Page | Route / Component | Fetch URL / Query Pattern | Source of Truth | Seed vs API Status |
|---|---|---|---|---|---|
| 1 | **Public Landing Page** | `src/app/(public)/page.tsx` | `GET /api/listings?limit=3&sort=newest` | PostgreSQL (`listings` where `status = 'active'`) | **Live API** (`SEED_LISTINGS` retired) |
| 2 | **Buyer Search / Grid / List** | `src/app/dashboard/buyer/search/page.tsx` | `GET /api/listings?query={q}&transactionType={t}&propertyType={p}&lga={l}&location={loc}&bedrooms={b}&minPrice={min}&maxPrice={max}&sort={s}` | PostgreSQL (`listings` where `status = 'active'`) | **Live API** (`SEED_LISTINGS` retired) |
| 3 | **NLP / Pidgin Search Bar** | `src/components/search/NLPSearchBar.tsx` | Dispatches parsed filters to `useSearchStore`, which drives `GET /api/listings` | PostgreSQL (`listings` where `status = 'active'`) | **Live API** |
| 4 | **Search Filters Drawer** | `src/components/search/SearchFilters.tsx` | Syncs filter controls (LGA, District, Price, Beds, Type) with `useSearchStore` | PostgreSQL (`listings` where `status = 'active'`) | **Live API** |
| 5 | **Buyer Intelligence Hub** | `src/app/dashboard/buyer/page.tsx` | `GET /api/listings?limit=3&sort=newest` | PostgreSQL (`listings` where `status = 'active'`) | **Live API** (`SEED_LISTINGS` retired) |
| 6 | **AI Recommendations** | `src/app/dashboard/buyer/recommendations/page.tsx` | `GET /api/listings?sort=newest` | PostgreSQL (`listings` where `status = 'active'`) | **Live API** (`SEED_LISTINGS` retired) |
| 7 | **Property Detail View** | `src/app/dashboard/buyer/property/[id]/page.tsx` | `GET /api/listings/[id]` + `GET /api/listings?lga={lga}&limit=3` for similar | PostgreSQL (`listings`) | **Live API** (`SEED_LISTINGS` fallback removed) |
| 8 | **Seller Overview** | `src/app/dashboard/seller/page.tsx` | `GET /api/listings?owner=me&limit=3` | PostgreSQL (`listings` where `owner_id = session.user.id`) | **Live API** (`SEED_LISTINGS` retired) |
| 9 | **Seller My Listings** | `src/app/dashboard/seller/listings/page.tsx` | `GET /api/listings?owner=me` | PostgreSQL (`listings` where `owner_id = session.user.id`) | **Live API** (`SEED_LISTINGS` retired) |
| 10 | **Admin Overview** | `src/app/dashboard/admin/page.tsx` | `GET /api/listings` | PostgreSQL (`listings`) | **Live API** (`SEED_LISTINGS` retired) |
| 11 | **Admin Listings Moderation** | `src/app/dashboard/admin/listings/page.tsx` | `GET /api/listings` | PostgreSQL (`listings`) | **Live API** (`SEED_LISTINGS` retired) |
| 12 | **Admin Fraud & Quarantine** | `src/app/dashboard/admin/fraud/page.tsx` | `GET /api/listings` | PostgreSQL (`listings`) | **Live API** (`SEED_LISTINGS` retired) |
| 13 | **Search State Store** | `src/store/search.ts` | Initial state `results: []` | Dynamically populated by API queries | **Live API** (`SEED_LISTINGS` retired) |

---

## 2. Supported `GET /api/listings` Query Parameters

The `GET /api/listings` endpoint supports comprehensive querying across both public buyer filters and authenticated seller/owner scopes:

### Public Buyer Parameters
- `limit` (number): Limits maximum returned rows (e.g. `?limit=3`).
- `offset` (number): Pagination offset.
- `sort` (string): Sorting order:
  - `newest`: `ORDER BY l.created_at DESC`
  - `price_asc`: `ORDER BY l.asking_price ASC`
  - `price_desc`: `ORDER BY l.asking_price DESC`
  - `most_saved`: `ORDER BY l.saves DESC, l.views DESC`
  - `relevance`: Default ordering (`created_at DESC`).
- `query` (string): Case-insensitive fuzzy search across `title`, `location`, and `description`.
- `lga` (string): Filters strictly by Area Council (`AMAC`, `Bwari`, `Gwagwalada`, `Kuje`, `Kwali`, `Abaji`).
- `location` (string): Filters by district name (case-insensitive substring). Validated against LGA via `isValidLocationInLGA`.
- `transactionType` (string): `rent` or `sale`.
- `propertyType` (string): `flat`, `duplex`, `terrace`, `bungalow`, `mansion`, `commercial`, `land`.
- `bedrooms` (number): Filters listings with `bedrooms >= value`.
- `minPrice` (number): Minimum asking price in NGN (`asking_price >= minPrice`).
- `maxPrice` (number): Maximum asking price in NGN (`asking_price <= maxPrice`).

### Seller / Owner Parameters
- `owner=me` or `my=true`: Scopes query to the authenticated Better Auth session user (`owner_id = session.user.id`).
- `ownerId` (string): Scopes query to a specific owner ID (accessible by owner themselves or `role=admin`).
- `status` (string): Filter owner listings by status (`pending`, `active`, `paused`, `sold`, `rejected`, or `all`).
- `limit` & `offset`: Paginate owner listings.

---

## 3. Immediate Active Insertion

When a seller creates a listing via `POST /api/listings`:
- Database record is created with `status: 'active'` (updated from previous `'pending'`).
- The listing is immediately returned and visible on all public search surfaces, including `GET /api/listings?limit=3&sort=newest` on the landing page and the buyer search grid, without requiring any manual SQL `UPDATE`.
