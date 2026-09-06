-- =========================================================
-- KisanSetu Supabase Migration: Unified Schema & Profile Columns
-- Safe, idempotent SQL migration for existing Supabase databases
-- =========================================================

-- 1. Update farmers table with missing profile and auth columns
ALTER TABLE public.farmers
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS primary_crops TEXT[],
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'phone',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ensure buyers table has all required columns
ALTER TABLE public.buyers
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'West Bengal',
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Standard 24h RTGS settlement',
ADD COLUMN IF NOT EXISTS crops_purchased JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Ensure listings table has all required columns
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS quality_grade TEXT DEFAULT 'Grade A',
ADD COLUMN IF NOT EXISTS harvest_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS expected_price_per_kg NUMERIC,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Ensure offers table has all required columns
ALTER TABLE public.offers
ADD COLUMN IF NOT EXISTS estimated_transport_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_return_to_farmer NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pickup_location TEXT DEFAULT 'Farm Gate',
ADD COLUMN IF NOT EXISTS delivery_location TEXT DEFAULT 'Mandi Yard',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Helpful performance & lookup indexes
CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON public.farmers(mobile);
CREATE INDEX IF NOT EXISTS idx_farmers_email ON public.farmers(email);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON public.listings(crop_name);
CREATE INDEX IF NOT EXISTS idx_listings_farmer ON public.listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_offers_farmer ON public.offers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON public.offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing ON public.offers(listing_id);
