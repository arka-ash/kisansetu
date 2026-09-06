-- =========================================================
-- KisanSetu PostgreSQL Database Schema for Supabase
-- Problem Statement: SIH 26047 - Market Linkages & Price Discovery
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FARMERS TABLE (Unified farmer schema supporting Google & Phone auth profiles)
CREATE TABLE IF NOT EXISTS public.farmers (
    id TEXT PRIMARY KEY DEFAULT ('farmer-' || floor(extract(epoch from now()) * 1000)::text),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    email TEXT,
    avatar_url TEXT,
    address TEXT,
    location TEXT NOT NULL,
    district TEXT,
    state TEXT,
    pincode TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    farm_size_acres NUMERIC DEFAULT 3.0,
    fpo_name TEXT,
    primary_crops TEXT[],
    upi_id TEXT,
    auth_provider TEXT DEFAULT 'phone',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BUYERS TABLE
CREATE TABLE IF NOT EXISTS public.buyers (
    id TEXT PRIMARY KEY DEFAULT ('buyer-' || floor(extract(epoch from now()) * 1000)::text),
    name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    location TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'West Bengal',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    verified BOOLEAN DEFAULT TRUE,
    rating NUMERIC(2,1) DEFAULT 4.5,
    payment_terms TEXT DEFAULT 'Standard 24h RTGS settlement',
    crops_purchased JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FARMER PRODUCE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY DEFAULT ('listing-' || floor(extract(epoch from now()) * 1000)::text),
    farmer_id TEXT REFERENCES public.farmers(id) ON DELETE SET NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL,
    quality_grade TEXT NOT NULL DEFAULT 'Grade A',
    harvest_date DATE DEFAULT CURRENT_DATE,
    location TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    expected_price_per_kg NUMERIC,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_OFFER', 'SOLD', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DIGITAL OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY DEFAULT ('offer-' || floor(extract(epoch from now()) * 1000)::text),
    listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,
    farmer_id TEXT,
    farmer_name TEXT NOT NULL,
    buyer_id TEXT REFERENCES public.buyers(id) ON DELETE SET NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL,
    quality_grade TEXT NOT NULL,
    offered_price_per_kg NUMERIC NOT NULL,
    total_value NUMERIC NOT NULL,
    estimated_transport_cost NUMERIC NOT NULL DEFAULT 0,
    net_return_to_farmer NUMERIC NOT NULL,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast searches and geospatial distance calculations
CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON public.farmers(mobile);
CREATE INDEX IF NOT EXISTS idx_farmers_email ON public.farmers(email);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON public.listings(crop_name);
CREATE INDEX IF NOT EXISTS idx_listings_farmer ON public.listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_offers_farmer ON public.offers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON public.offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing ON public.offers(listing_id);

-- Enable Row Level Security (RLS) with open read/write access for demo hackathon
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on farmers" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on farmers" ON public.farmers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on farmers" ON public.farmers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on buyers" ON public.buyers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on buyers" ON public.buyers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on buyers" ON public.buyers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on listings" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on listings" ON public.listings FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on offers" ON public.offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on offers" ON public.offers FOR UPDATE USING (true);
