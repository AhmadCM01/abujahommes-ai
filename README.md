# AbujaHommes AI

AbujaHommes AI is a specialized real estate platform engineered exclusively for the Federal Capital Territory (Abuja). It provides transparent property search, algorithmic automated valuation (AVM) price bands, rule-based fraud risk scoring, in-app buyer–seller chat, and dedicated workflow dashboards for buyers, sellers, and administrators.

## Stack

- **Framework**: Next.js 15 (App Router with Turbopack), TypeScript, Tailwind CSS
- **Authentication**: Better Auth (Email/Password + Google OAuth 2.0)
- **Database**: PostgreSQL 16 (Supabase)
- **Object Storage**: Supabase Storage (`listing-photos`, `avatars`)
- **Email**: Resend (asynchronous transactional queue via PostgreSQL `email_messages`)
- **State Management**: Zustand
- **ML Microservice (Optional)**: Python FastAPI with scikit-learn under `ml-service/`

## Features

- **Natural Language & Filtered Search**: Search properties across Abuja districts using English or Pidgin phrasing, or filter by Area Council (AMAC, Bwari, Gwagwalada, Kuje, Bwari, Kwali, Abaji), district, price range, bedrooms, property type (flat, duplex, terrace, bungalow, detached, semi-detached, commercial, land), and title category.
- **Automated Valuation Model (AVM)**: Displays honest fair-price benchmark bands calibrated against transaction type (annual rent vs. outright sale) and district baselines. Enforces suppression rules to hide bands when estimates are mathematically anomalous or low confidence.
- **Fraud Risk Screening**: Automated multi-factor screening across 7 risk indicators (pricing anomalies, title ambiguity, distress sale triggers, duplicate imagery). Displays transparent risk chips (`Low Fraud Risk`, `Moderate Risk`, `High Risk`, `Critical Risk`) without claiming unverified statutory title validation.
- **Listing Lifecycle Management**: Multi-step seller listing wizard with image upload, location validation against Abuja LGA taxonomy, status toggles (`active`, `paused`, `sold`), and dynamic fraud/AVM recalculation upon price edits.
- **Direct Buyer–Seller Chat**: Real-time listing-linked messaging threads between prospective buyers and property owners with polling fallback and unread notifications.
- **Buyer Utility Tools**: Interactive cost breakdown estimator (agency fees, legal documentation, stamp duty), property favourites, saved search alerts, and direct enquiry dispatch.
- **Role-Based Portals**: Dedicated dashboard views and navigation for Buyers, Sellers, and System Administrators.
- **Admin Management**: Centralized oversight for listing approvals, fraud flagging metrics, user roles, and system activity logs.

## Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: PostgreSQL 16 database (such as Supabase)
- **Supabase Storage**: Active project for image bucket hosting
- **Resend Account**: API key for transactional emails
- **Google Cloud Console**: OAuth 2.0 Client ID (optional, for Google Sign-In)
- **Python 3.10+**: (Optional, only needed if running the standalone ML microservice)

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/AhmadCM01/abujahommes-ai.git
cd abujahommes-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL connection string for migrations |
| `BETTER_AUTH_SECRET` | 32-byte secret key for Better Auth session signing |
| `BETTER_AUTH_URL` | Base URL of authentication server (`http://localhost:3000`) |
| `AUTH_SECRET` | Secret key for auth token signing |
| `AUTH_URL` | Auth callback base URL |
| `NEXT_PUBLIC_APP_URL` | Application root URL (`http://localhost:3000` in local dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret (optional) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for rate limiting (optional) |
| `UPSTASH_REDIS_REST_TOKEN`| Upstash Redis REST token (optional) |
| `REDIS_URL` | Standard Redis connection URL (optional) |
| `RESEND_API_KEY` | Resend API key for transactional delivery |
| `EMAIL_FROM_TRANSACTIONAL`| Sender address (e.g. `AbujaHommes <noreply@mail.abujahommes.com>`) |
| `EMAIL_FROM_UPDATES` | Sender address for system updates |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for storage uploads) |
| `NEXT_PUBLIC_ML_SERVICE_URL` | Public URL of FastAPI ML service (default: `http://localhost:8000`) |
| `ML_SERVICE_URL` | Internal URL of FastAPI ML service |
| `GEMINI_API_KEY` | Google Gemini API key for advanced NLP intent parsing (optional) |

### 4. Database Migrations

Apply the SQL migration scripts in order to your PostgreSQL database (via Supabase SQL Editor or CLI):

1. `supabase/migrations/20260912_phase1_identity_and_canonical_users.sql` — Identity tables, user accounts, and verification schema
2. `supabase/migrations/20260914_phase2_listings_and_relations.sql` — Property listings, favourites, saved searches, enquiries, notifications, and email queue
3. `supabase/migrations/20260917_slice3_buyer_seller_chat.sql` — Chat conversation threads and message storage

*(Alternatively, run `supabase/schema.sql` for the complete consolidated schema.)*

### 5. Storage Buckets

In your Supabase project dashboard:
1. Navigate to **Storage** → **New Bucket**.
2. Create bucket named `listing-photos` and set **Public bucket** to enabled.
3. Create bucket named `avatars` and set **Public bucket** to enabled.

### 6. Run the Application

```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

### 7. Run the ML Service (Optional)

If running the Python price prediction microservice locally:

```bash
cd ml-service
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

*(Note: The Next.js API includes a built-in statistical regression fallback engine, so the core platform functions even if the Python service is offline.)*

## Scripts

From `package.json`:

- `npm run dev`: Runs Next.js in development mode with Turbopack (`http://localhost:3000`).
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Executes ESLint code quality checks.
- `npm run email:process`: Runs the background worker script (`scripts/process-email-queue.ts`) to deliver queued verification and notification emails via Resend.

## Auth Notes

- **Identity Engine**: Authentication is handled by **Better Auth**, which manages identity and sessions in native PostgreSQL tables (`user`, `session`, `account`, `verification`). Supabase Auth is not used.
- **Google OAuth**: Authorized redirect URI is `/api/auth/callback/google`. Ensure this path is added to your Google Cloud Console credentials under Authorized redirect URIs.
- **Email Verification**: Email verification is required before access is granted. In Resend test mode without a verified domain, emails can only be delivered to the registered Resend account address. When running locally without a Resend key, verification links are safely recorded in the `email_messages` table and logged to the developer console.

## Deploy (Vercel)

1. Connect the GitHub repository to Vercel.
2. In Vercel Project Settings, add all production environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`, and `AUTH_URL` to your production HTTPS URL (e.g. `https://abujahommes.com` or `https://abujahommes.vercel.app`).
4. Update Google Cloud Console Authorized origins and Redirect URIs to include the production domain:
   - Origin: `https://your-domain.vercel.app`
   - Redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
5. Ensure production database connection string (`DATABASE_URL`) has proper connection pooling enabled.
6. Never commit secrets, credentials, or `.env` files to git.

## Project Structure

```
abujahommes-ai/
├── docs/                 # AVM valuation rules and district documentation
├── ml-service/           # FastAPI price prediction service
│   ├── main.py
│   ├── train.py
│   ├── Dockerfile
│   └── requirements.txt
├── public/               # Static assets, branding, and icons
├── scripts/              # Background utilities (email queue processor)
├── src/
│   ├── app/              # Next.js App Router (pages & API endpoints)
│   │   ├── (public)/     # Public landing, privacy, terms
│   │   ├── api/          # Backend API routes (auth, chat, listings, fraud)
│   │   ├── auth/         # Authentication flows (login, register, verify)
│   │   └── dashboard/    # Role dashboards (buyer, seller, admin)
│   ├── components/       # Design system, layout shells, cards, property UI
│   ├── lib/              # Database access, auth config, email, validation
│   ├── store/            # Zustand stores (auth, search, chat, notifications)
│   ├── styles/           # Design tokens, color system, and globals.css
│   └── types/            # TypeScript domain models and schemas
├── supabase/
│   ├── migrations/       # Versioned SQL migrations (01, 02, 03)
│   └── schema.sql        # Full database schema
└── README.md
```

## License

Private / Proprietary. All rights reserved.
