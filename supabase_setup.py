"""
supabase_setup.py
=================
Creates all JMR Global tables in Supabase and seeds them with data.

Requirements:
    pip install supabase dukpy requests

Usage:
    python supabase_setup.py

Set these in your .env (same folder as this script, or C:/Users/mcall/JMR Global/jmr-trade-platform/.env):
    SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=eyJ...
"""

import os
import re
import json
import pathlib
import sys
from datetime import datetime

# ── Load env ──────────────────────────────────────────────────────────────────
def load_env():
    env_paths = [
        pathlib.Path(".env"),
        pathlib.Path(r"C:/Users/mcall/JMR Global/jmr-trade-platform/.env"),
    ]
    for p in env_paths:
        if p.exists():
            for line in p.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())
            # Map custom alternative .env names right after loading them
            if not os.environ.get("SUPABASE_URL") and os.environ.get("REACT_APP_SUPABASE_URL"):
                os.environ["SUPABASE_URL"] = os.environ["REACT_APP_SUPABASE_URL"]
            if not os.environ.get("SUPABASE_SERVICE_ROLE_KEY") and os.environ.get("SUPABASE_SERVICE_ROLE"):
                os.environ["SUPABASE_SERVICE_ROLE_KEY"] = os.environ["SUPABASE_SERVICE_ROLE"]
            print(f"✅ Loaded env from {p}")
            return
    print("⚠️  No .env found — using existing environment variables")

load_env()

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("SUPABASE_DB_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("Run: pip install supabase")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"✅ Connected to Supabase: {SUPABASE_URL}")

# ── Data paths ─────────────────────────────────────────────────────────────────
DATA_PATH = pathlib.Path(r"C:\Users\mcall\JMR Global\jmr-trade-platform\src\data")

# ── JS extractor ───────────────────────────────────────────────────────────────
def extract_js(filename):
    try:
        import dukpy
    except ImportError:
        print("Run: pip install dukpy")
        sys.exit(1)

    filepath = DATA_PATH / filename
    raw = filepath.read_text(encoding="utf-8")
    js_code = raw.replace("export const ", "var ").replace("export default ", "var _default = ")
    match = re.search(r"var\s+(\w+)\s*=", js_code)
    if not match:
        raise ValueError(f"Could not find variable in {filename}")
    varname = match.group(1)
    js_code += f"\nJSON.stringify({varname});"
    result = dukpy.evaljs(js_code)
    return json.loads(result)

# ── SQL: Create tables ─────────────────────────────────────────────────────────
CREATE_TABLES_SQL = """
-- Suppliers
create table if not exists suppliers (
    id text primary key,
    name text not null,
    country text,
    country_code text,
    city text,
    role text,
    product_category text,
    products jsonb,
    website text,
    notes text,
    verified boolean default false,
    export_experience boolean default false,
    food_grade boolean default false,
    priority integer,
    size text,
    annual_capacity_mt text,
    parent_company text,
    contact_approach text,
    certifications jsonb,
    fob_price_range text,
    nearest_port text,
    port_distance_km integer,
    port_notes text,
    contacted boolean default false,
    contact_date date,
    contact_method text,
    contact_outcome text,
    next_action text,
    next_action_date date,
    docs_received jsonb,
    lat double precision,
    lng double precision,
    status text,
    distribution text,
    warehouses jsonb,
    iso_certified boolean,
    market_share_pct integer,
    pharmaceutical_grade boolean,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Buyers
create table if not exists buyers (
    id text primary key,
    name text not null,
    country text,
    city text,
    category text,
    website text,
    email text,
    revenue_usd_m numeric,
    size text,
    manufactures jsonb,
    distributes jsonb,
    ingredient_needs jsonb,
    notes text,
    status text,
    contacted boolean default false,
    lat double precision,
    lng double precision,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Contacts
create table if not exists contacts (
    id text primary key,
    name text not null,
    company text,
    title text,
    email text,
    phone text,
    whatsapp text,
    country text,
    status text,
    supplier_id text references suppliers(id),
    specialities jsonb,
    contact_method text,
    last_contacted date,
    next_action text,
    next_action_date date,
    contact_outcome text,
    notes text,
    linkedin text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Deals
create table if not exists deals (
    id text primary key,
    title text not null,
    status text,
    route_from text,
    route_to text,
    supplier_id text references suppliers(id),
    product text,
    spec jsonb,
    volume text,
    price_exw numeric,
    price_fob numeric,
    price_cif_target numeric,
    price_cif_benchmark numeric,
    port_origin text,
    port_destination text,
    notes text,
    next_action text,
    next_action_date date,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Ingredient flows
create table if not exists ingredient_flows (
    id serial primary key,
    ingredient text not null,
    description text,
    supplied_by jsonb,
    used_in jsonb,
    african_buyers jsonb,
    created_at timestamptz default now()
);

-- Product intel
create table if not exists product_intel (
    id serial primary key,
    product text not null,
    product_key text,
    hs_code text,
    total_cif_usd numeric,
    total_volume_mt numeric,
    avg_cif_per_kg numeric,
    latam_pct numeric,
    latam_cif_usd numeric,
    gap_signal text,
    gap_note text,
    top_suppliers jsonb,
    latam_suppliers jsonb,
    our_suppliers jsonb,
    year integer,
    created_at timestamptz default now()
);

-- Trade flows (opportunity data)
create table if not exists trade_flows (
    id serial primary key,
    exporter text,
    importer text,
    importer_code integer,
    hs_code text,
    product text,
    layer text,
    year integer,
    fob_usd numeric,
    volume_mt numeric,
    price_per_kg numeric,
    price_per_mt numeric,
    importer_l2_exports numeric,
    importer_is_processor boolean,
    importer_processing_ratio numeric,
    created_at timestamptz default now()
);

-- Tariff rates
create table if not exists tariff_rates (
    hs_code text primary key,
    description text,
    general text,
    sadc text,
    mercosur text,
    afcfta text,
    eu text,
    general_pct numeric,
    mercosur_pct numeric,
    general_zar_per_kg numeric,
    mercosur_zar_per_kg numeric,
    unit text,
    confirmed boolean default false,
    notes text,
    source text,
    last_updated date,
    created_at timestamptz default now()
);
"""

# ── Create tables via REST ─────────────────────────────────────────────────────
import requests

def run_sql(sql):
    """Execute SQL via Supabase REST endpoint"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    # Use the pg connection string approach via the management API
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    # Split into individual statements and run each
    statements = [s.strip() for s in sql.split(";") if s.strip()]
    errors = []
    for stmt in statements:
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
            headers=headers,
            json={"query": stmt}
        )
        if resp.status_code not in (200, 201, 204):
            errors.append(f"  SQL error: {resp.text[:200]}")
    return errors

print("\n📋 NOTE: Supabase REST API doesn't support raw DDL via RPC by default.")
print("Please create tables manually using the SQL below in your Supabase SQL Editor:")
print("(Dashboard → SQL Editor → New query → paste → Run)\n")
print("=" * 60)
print(CREATE_TABLES_SQL)
print("=" * 60)
print("\nOnce tables are created, re-run this script with --seed flag:")
print("  python supabase_setup.py --seed\n")

# ── Seed data ──────────────────────────────────────────────────────────────────
def merge_suppliers(hardcoded, firestore):
    """Merge Firestore supplier records into hardcoded (hardcoded wins on conflict)"""
    fs_map = {s["id"]: s for s in firestore}
    hc_map = {s["id"]: s for s in hardcoded}

    merged = []
    all_ids = set(list(hc_map.keys()) + list(fs_map.keys()))

    for sid in all_ids:
        hc = hc_map.get(sid, {})
        fs = fs_map.get(sid, {})
        # Start with Firestore, overlay hardcoded (hardcoded is more detailed)
        record = {**fs, **hc}
        record["id"] = sid
        merged.append(record)

    return merged

def clean_supplier(s):
    """Normalise supplier record for Supabase insert"""
    return {
        "id": s.get("id"),
        "name": s.get("name"),
        "country": s.get("country"),
        "country_code": s.get("country_code"),
        "city": s.get("city"),
        "role": s.get("role"),
        "product_category": s.get("product_category"),
        "products": json.dumps(s.get("products") or []),
        "website": s.get("website"),
        "notes": s.get("notes"),
        "verified": s.get("verified", False),
        "export_experience": s.get("export_experience", False),
        "food_grade": s.get("food_grade", False),
        "priority": s.get("priority"),
        "size": s.get("size"),
        "annual_capacity_mt": str(s.get("annual_capacity_mt", "") or ""),
        "parent_company": s.get("parent_company"),
        "contact_approach": s.get("contact_approach"),
        "certifications": json.dumps(s.get("certifications") or []),
        "fob_price_range": s.get("fobPriceRange") or s.get("fob_price_range"),
        "nearest_port": s.get("nearest_port"),
        "port_distance_km": s.get("port_distance_km"),
        "port_notes": s.get("port_notes"),
        "contacted": s.get("contacted", False),
        "contact_date": s.get("contact_date"),
        "contact_method": s.get("contact_method"),
        "contact_outcome": s.get("contact_outcome"),
        "next_action": s.get("next_action"),
        "next_action_date": s.get("next_action_date"),
        "docs_received": json.dumps(s.get("docs_received") or []),
        "lat": s.get("lat"),
        "lng": s.get("lng"),
        "status": s.get("status"),
        "market_share_pct": s.get("market_share_pct"),
        "pharmaceutical_grade": s.get("pharmaceutical_grade", False),
    }

def clean_buyer(b):
    return {
        "id": b.get("id"),
        "name": b.get("name"),
        "country": b.get("country"),
        "city": b.get("city"),
        "category": b.get("category"),
        "website": b.get("website"),
        "email": b.get("email"),
        "revenue_usd_m": b.get("revenue_usd_m"),
        "size": b.get("size"),
        "manufactures": json.dumps(b.get("manufactures") or []),
        "distributes": json.dumps(b.get("distributes") or []),
        "ingredient_needs": json.dumps(b.get("ingredient_needs") or []),
        "notes": b.get("notes"),
        "status": b.get("status"),
        "contacted": b.get("contacted", False),
        "lat": b.get("lat"),
        "lng": b.get("lng"),
    }

def clean_contact(c):
    # Parse specialities from Firestore arrayValue format if needed
    specs = c.get("specialities", [])
    if isinstance(specs, str) and "arrayValue" in specs:
        try:
            vals = re.findall(r"'stringValue': '([^']+)'", specs)
            specs = vals
        except:
            specs = []

    return {
        "id": c.get("id"),
        "name": c.get("name"),
        "company": c.get("company"),
        "title": c.get("title"),
        "email": c.get("email"),
        "phone": c.get("phone"),
        "whatsapp": c.get("whatsapp"),
        "country": c.get("country"),
        "status": c.get("status"),
        "supplier_id": c.get("supplier_id"),
        "specialities": json.dumps(specs),
        "contact_method": c.get("contact_method"),
        "last_contacted": c.get("last_contacted") or c.get("last_contact") or None,
        "next_action": c.get("next_action"),
        "next_action_date": c.get("next_action_date"),
        "contact_outcome": c.get("contact_outcome"),
        "notes": c.get("notes"),
        "linkedin": c.get("linkedin"),
        "updated_at": c.get("updated_at"),
        "created_at": c.get("created_at"),
    }

def clean_trade_flow(t):
    return {
        "exporter": t.get("exporter"),
        "importer": t.get("importer"),
        "importer_code": t.get("importer_code"),
        "hs_code": str(t.get("hs_code", "")),
        "product": t.get("product"),
        "layer": t.get("layer"),
        "year": t.get("year"),
        "fob_usd": t.get("fob_usd"),
        "volume_mt": t.get("volume_mt"),
        "price_per_kg": t.get("price_per_kg"),
        "price_per_mt": t.get("price_per_mt"),
        "importer_l2_exports": t.get("importer_l2_exports"),
        "importer_is_processor": t.get("importer_is_processor", False),
        "importer_processing_ratio": t.get("importer_processing_ratio"),
    }

TARIFF_DATA = {
    "350510": {"description": "Modified Starch", "general": "FREE", "sadc": "FREE", "mercosur": "FREE", "afcfta": "FREE", "eu": "FREE", "general_pct": 0, "mercosur_pct": 0, "unit": "ad_valorem", "confirmed": True, "notes": "FREE across all trading partners"},
    "040221": {"description": "Full Cream Milk Powder", "general": "450c/kg", "sadc": "FREE", "mercosur": "450c/kg", "afcfta": "180c/kg", "eu": "FREE", "general_zar_per_kg": 4.5, "mercosur_zar_per_kg": 4.5, "unit": "specific", "confirmed": True, "notes": "No MERCOSUR preference. SADC free. AfCFTA 180c/kg."},
    "151211": {"description": "Sunflower Oil (crude)", "general": "10%", "sadc": "FREE", "mercosur": "4%", "afcfta": "TBC", "eu": "FREE", "general_pct": 0.1, "mercosur_pct": 0.04, "unit": "ad_valorem", "confirmed": True, "notes": "MERCOSUR preferential rate 4% vs 10% MFN."},
    "150790": {"description": "Soybean Oil", "general": "10%", "sadc": "FREE", "mercosur": "10%", "afcfta": "TBC", "eu": "FREE", "general_pct": 0.1, "mercosur_pct": 0.1, "unit": "ad_valorem", "confirmed": True, "notes": "No MERCOSUR preference."},
    "230400": {"description": "Soybean Meal", "general": "6.6%", "sadc": "FREE", "mercosur": "2.64%", "afcfta": "TBC", "eu": "FREE", "general_pct": 0.066, "mercosur_pct": 0.0264, "unit": "ad_valorem", "confirmed": True, "notes": "MERCOSUR preferential 2.64% vs 6.6% MFN."},
    "100590": {"description": "Corn (Maize)", "general": "FREE", "sadc": "FREE", "mercosur": "FREE", "afcfta": "FREE", "eu": "FREE", "general_pct": 0, "mercosur_pct": 0, "unit": "ad_valorem", "confirmed": True, "notes": "FREE across all trading partners"},
    "120190": {"description": "Soybeans", "general": "FREE", "sadc": "FREE", "mercosur": "FREE", "afcfta": "FREE", "eu": "FREE", "general_pct": 0, "mercosur_pct": 0, "unit": "ad_valorem", "confirmed": True, "notes": "FREE across all trading partners"},
    "110100": {"description": "Wheat Flour", "general": "23.05c/kg", "sadc": "FREE", "mercosur": "23.05c/kg", "afcfta": "TBC", "eu": "FREE", "general_zar_per_kg": 0.2305, "mercosur_zar_per_kg": 0.2305, "unit": "specific", "confirmed": True, "notes": "Specific duty. No MERCOSUR preference."},
    "292390": {"description": "Soya Lecithin", "general": "FREE", "sadc": "FREE", "mercosur": "FREE", "afcfta": "FREE", "eu": "FREE", "general_pct": 0, "mercosur_pct": 0, "unit": "ad_valorem", "confirmed": True, "notes": "FREE. SA HS classification for lecithin imports."},
}

def seed_all(suppliers_hc, buyers, contacts, ingredient_flows, product_intel, trade_flows):
    # We need the Firestore suppliers from the earlier extraction
    # They're hardcoded here from the output you pasted
    firestore_suppliers = []  # Will be populated from Firestore extract output

    print("\n🌱 Seeding Supabase...\n")

    # 1. Suppliers
    merged = merge_suppliers(suppliers_hc, firestore_suppliers)
    cleaned = [clean_supplier(s) for s in merged]
    print(f"  Upserting {len(cleaned)} suppliers...")
    resp = supabase.table("suppliers").upsert(cleaned).execute()
    print(f"  ✅ Suppliers done")

    # 2. Buyers
    cleaned_buyers = [clean_buyer(b) for b in buyers]
    print(f"  Upserting {len(cleaned_buyers)} buyers...")
    supabase.table("buyers").upsert(cleaned_buyers).execute()
    print(f"  ✅ Buyers done")

    # 3. Contacts — check supplier_id exists first
    valid_supplier_ids = {s["id"] for s in merged}
    cleaned_contacts = []
    for c in contacts:
        cc = clean_contact(c)
        if cc.get("supplier_id") and cc["supplier_id"] not in valid_supplier_ids:
            print(f"  ⚠️  Contact {cc['name']} has unknown supplier_id {cc['supplier_id']} — setting null")
            cc["supplier_id"] = None
        cleaned_contacts.append(cc)

    print(f"  Upserting {len(cleaned_contacts)} contacts...")
    supabase.table("contacts").upsert(cleaned_contacts).execute()
    print(f"  ✅ Contacts done")

    # 4. Ingredient flows
    cleaned_flows = []
    for f in ingredient_flows:
        cleaned_flows.append({
            "ingredient": f.get("ingredient"),
            "description": f.get("description"),
            "supplied_by": json.dumps(f.get("supplied_by") or []),
            "used_in": json.dumps(f.get("used_in") or []),
            "african_buyers": json.dumps(f.get("african_buyers") or []),
        })
    print(f"  Inserting {len(cleaned_flows)} ingredient flows...")
    supabase.table("ingredient_flows").upsert(cleaned_flows).execute()
    print(f"  ✅ Ingredient flows done")

    # 5. Product intel
    cleaned_intel = []
    for p in product_intel:
        cleaned_intel.append({
            "product": p.get("product"),
            "product_key": p.get("product_key"),
            "hs_code": str(p.get("hs_code", "")),
            "total_cif_usd": p.get("total_cif_usd"),
            "total_volume_mt": p.get("total_volume_mt"),
            "avg_cif_per_kg": p.get("avg_cif_per_kg"),
            "latam_pct": p.get("latam_pct"),
            "latam_cif_usd": p.get("latam_cif_usd"),
            "gap_signal": p.get("gap_signal"),
            "gap_note": p.get("gap_note"),
            "top_suppliers": json.dumps(p.get("top_suppliers") or []),
            "latam_suppliers": json.dumps(p.get("latam_suppliers") or []),
            "our_suppliers": json.dumps(p.get("our_suppliers") or []),
            "year": p.get("year"),
        })
    print(f"  Inserting {len(cleaned_intel)} product intel records...")
    supabase.table("product_intel").upsert(cleaned_intel).execute()
    print(f"  ✅ Product intel done")

    # 6. Trade flows (insert in batches of 100)
    cleaned_tf = [clean_trade_flow(t) for t in trade_flows]
    print(f"  Inserting {len(cleaned_tf)} trade flow records...")
    for i in range(0, len(cleaned_tf), 100):
        batch = cleaned_tf[i:i+100]
        supabase.table("trade_flows").upsert(batch).execute()
    print(f"  ✅ Trade flows done")

    # 7. Tariff rates
    tariff_rows = []
    for hs, rate in TARIFF_DATA.items():
        tariff_rows.append({
            "hs_code": hs,
            "description": rate.get("description"),
            "general": rate.get("general"),
            "sadc": rate.get("sadc"),
            "mercosur": rate.get("mercosur"),
            "afcfta": rate.get("afcfta"),
            "eu": rate.get("eu"),
            "general_pct": rate.get("general_pct"),
            "mercosur_pct": rate.get("mercosur_pct"),
            "general_zar_per_kg": rate.get("general_zar_per_kg"),
            "mercosur_zar_per_kg": rate.get("mercosur_zar_per_kg"),
            "unit": rate.get("unit"),
            "confirmed": rate.get("confirmed", False),
            "notes": rate.get("notes"),
            "source": "SARS Schedule 1 Part 1",
            "last_updated": "2026-05-15",
        })
    print(f"  Inserting {len(tariff_rows)} tariff rates...")
    supabase.table("tariff_rates").upsert(tariff_rows).execute()
    print(f"  ✅ Tariff rates done")

    print("\n🎉 All data seeded successfully!")


# ── Main ───────────────────────────────────────────────────────────────────────
if "--seed" in sys.argv:
    print("\n📦 Extracting data files...")
    try:
        suppliers_hc    = extract_js("supplierData.js")
        buyers          = extract_js("buyerData.js")
        ingredient_flows = extract_js("ingredientFlowData.js")
        product_intel   = extract_js("productIntelData.js")
        trade_flows     = extract_js("opportunityData.js")
        print(f"  suppliers: {len(suppliers_hc)}, buyers: {len(buyers)}, "
              f"flows: {len(ingredient_flows)}, intel: {len(product_intel)}, "
              f"trade: {len(trade_flows)}")
    except Exception as e:
        print(f"❌ Data extraction failed: {e}")
        sys.exit(1)

    # Contacts from Firestore extract (pasted earlier)
    CONTACTS_FROM_FIRESTORE = [
        {"id": "2iYLmoTPOFKlCiHnhIZJ", "name": "Niltinho Jacobsen", "company": "Fecularia Salto Pilão SA", "title": "President", "email": "", "phone": "+595 983 953010", "whatsapp": "+595 983 953010", "country": "Paraguay", "status": "No Fit", "supplier_id": "fecularia_salto_pilao", "contact_method": "WhatsApp", "last_contacted": "2026-05-26", "notes": "Helpful guy. He gave Jordani Rodrigues' contact at Horizonte Amidos in Brazil.", "specialities": ["Wheat Starch", "Cassava Starch", "Maize Starch"], "updated_at": "2026-05-28T19:25:16.195Z", "created_at": "2026-05-26T21:27:34.086Z"},
        {"id": "TNku0iKbpWkXiI4euTqm", "name": "Elisa Vizcaino", "company": "Lorenz", "title": "Export / Commercial", "email": "elisa.vizcaino@gtf.com.br", "phone": "+55 44 98831 9444", "whatsapp": "", "country": "Brazil", "status": "No Fit", "supplier_id": "lorenz_brazil", "contact_method": "Email", "last_contacted": "2026-06-04", "next_action": "Inquiry closed 2026-06-08 - price not competitive vs Egypt. Keep warm for specialty starch.", "contact_outcome": "WTA $2,115/MT and 566W $2,655/MT FOB Paranaguá. Gap too large.", "notes": "Direct contact at GTF/Lorenz.", "specialities": ["Maize Starch", "Modified Starch E1422", "Cassava Starch"], "next_action_date": "2026-09-01", "updated_at": "2026-06-06T10:46:42.999Z"},
        {"id": "U5trmFMwBlUEywyh3p2X", "name": "Maria Ines Marrazzo", "company": "Barentz Argentina", "title": "Head BU Human Nutrition", "email": "Mariaines.marrazzo@barentz.com", "phone": "+54 (11) 52 63 07 13", "whatsapp": "+54 (11) 52 63 07 13", "country": "Argentina", "status": "Active", "supplier_id": "barentz_argentina", "contact_method": "Email", "last_contacted": "2026-05-28", "notes": "", "specialities": ["Modified Starch E1422", "General Ingredients", "Dairy / Milk Powder"], "updated_at": "2026-05-28T11:41:47.235Z", "created_at": "2026-05-28T11:39:46.352Z"},
        {"id": "VLAfVXmSLgrp3GCnOsiN", "name": "Fabián Sguiglia", "company": "Nomadi SRL", "title": "Gerente Comercio Exterior", "email": "info@nomadi.com.ar", "phone": "+54 11 4547 3412", "whatsapp": "", "country": "Argentina", "status": "Active", "supplier_id": "nomadi_argentina", "contact_method": "", "last_contacted": None, "notes": "Key contact for corn flour exports to Africa. Nomadi already exports to Angola and DRC.", "specialities": ["Corn Flour", "General Ingredients"]},
        {"id": "X3FievsQ2R88Eaorj31H", "name": "Fausto Nibale", "company": "F&F Ingredients S.A.", "title": "Commercial Manager", "email": "info@ffingredients.com.ar", "phone": "+54 3329 439720", "whatsapp": "+54 3329 439720", "country": "Argentina", "status": "Warm", "supplier_id": "ff_ingredients_argentina", "contact_method": "Online contact form", "last_contacted": "2026-05-26", "notes": "Responded same day. F&F distributes cassava E1422 (Brazil origin, non-GMO). On leave until 15 June.", "specialities": ["Wheat Starch", "Modified Wheat Starch", "Cassava Starch"], "updated_at": "2026-05-26T21:47:24.234Z", "created_at": "2026-05-26T17:15:35.194Z"},
        {"id": "bZLAQTGxlZzUmJwymn4G", "name": "Santiago Cieza", "company": "Tate & Lyle / Gemacom Tech", "title": "Sales Representative", "email": "Via Tate & Lyle contact form", "phone": "", "whatsapp": "", "country": "Argentina", "status": "Active", "supplier_id": None, "contact_method": "Tate & Lyle contact form", "last_contacted": "2026-05-26", "notes": "Contacted via Tate & Lyle BA office. Awaiting response re corn E1422 waxy for SA market.", "specialities": ["Modified Starch E1422", "General Ingredients"], "updated_at": "2026-05-26T17:15:35.463Z", "created_at": "2026-05-26T17:15:35.463Z"},
        {"id": "fE8hZtufCi0jEWociV37", "name": "Juan Manuel Cordiviola", "company": "Mastellone Hermanos (La Serenisima)", "title": "Jefe de Comercio Exterior", "email": "jcordiviola@mastellone.com.ar", "phone": "", "whatsapp": "", "country": "Argentina", "status": "Qualified", "supplier_id": "mastellone_argentina", "contact_method": "Email", "last_contacted": "2026-06-01", "notes": "Primary contact for FCMP export. Email sent re FCMP Medium Heat for SA coffee creamer client.", "specialities": ["Dairy / Milk Powder"], "updated_at": "2026-06-01T14:27:05.727Z"},
        {"id": "hJ7NTGVeGZ8ztgdIlX6x", "name": "Jordani Rodrigues", "company": "Horizonte Amidos (Grupo Horizonte)", "title": "Development & Application", "email": "jordani@horizonteamidos.com.br", "phone": "+55 45 8405-9675", "whatsapp": "+55 45 8405-9675", "country": "Brazil", "status": "Active", "supplier_id": "horizonte_amidos_brazil", "contact_method": "WhatsApp", "last_contacted": "2026-05-26", "next_action": "Holding email sent 2026-06-08 - awaiting freight quotes from Spring Logistic and DP World Curitiba.", "contact_outcome": "Client satisfied with SuperCorp CFW specs. Ex Works $910/MT.", "next_action_date": "2026-06-11", "notes": "Got the contact from Niltinho Jacobsen at Fecularia Salto Pilão SA.", "specialities": ["Modified Starch E1422", "Cassava Starch"], "updated_at": "2026-05-26T21:47:58.864Z", "created_at": "2026-05-26T21:23:20.783Z"},
        {"id": "ioGIsk8T6IYvLxauHZC1", "name": "Claudio Norbutas Filho", "company": "Amidos Nevada", "title": "Director", "email": "claudio@amidosnevada.com.br", "phone": "+55 67 9692-0016", "whatsapp": "+55 67 9692-0016", "country": "Brazil", "status": "Active", "supplier_id": "amidos_nevada_brazil", "contact_method": "", "last_contacted": None, "notes": "Amidos produces starch predominantly for industrial applications.", "specialities": ["Modified Wheat Starch", "Cassava Starch", "Maize Starch"], "updated_at": "2026-05-28T11:00:26.869Z", "created_at": "2026-05-28T11:00:26.869Z"},
        {"id": "lAAoHxeHeYmcGoIukLQV", "name": "Markus Klaassen", "company": "Claldy", "title": "Exportación y Comercio Exterior", "email": "mklaassen@claldy.com.uy", "phone": "", "whatsapp": "", "country": "Uruguay", "status": "Active", "supplier_id": "claldy_uruguay", "contact_method": "Email", "last_contacted": "2026-05-28", "notes": "Key contact for FCMP Medium Heat inquiry for SA market (25 MT x 3/year).", "specialities": ["Milk Powder FCMP", "Dairy"], "updated_at": "2026-05-28T19:45:51.431Z"},
        {"id": "mpb1nac7F8nlICgnnKrS", "name": "Leandro Kemerer", "company": "Glutal S.A.", "title": "Ventas", "email": "leandro@glutal.com.ar", "phone": "", "whatsapp": "", "country": "Argentina", "status": "No Fit", "supplier_id": "glutal_argentina", "contact_method": "Email", "last_contacted": "2026-05-29", "notes": "Glutal does not export — domestic Argentine market only.", "specialities": ["Modified Starch E1422", "Modified Corn Starch"], "updated_at": "2026-06-05T11:52:58.515Z"},
        {"id": "sgkrM820TQ8RvdDaBVUy", "name": "Alejandro Bonardi", "company": "Mastellone Hermanos (La Serenisima)", "title": "Comercio Exterior", "email": "abonardi@mastellone.com.ar", "phone": "", "whatsapp": "", "country": "Argentina", "status": "Active", "supplier_id": "mastellone_argentina", "contact_method": "Email", "last_contacted": "2026-06-05", "next_action": "Holding email sent 2026-06-08 - discussing with client. Awaiting Conaprole/Claldy Uruguay quotes.", "contact_outcome": "Mastellone quoted $4,100/MT FOB Buenos Aires FCMP Medium Heat. Not viable.", "next_action_date": "2026-06-09", "notes": "Mastellone sent FCMP specs - client satisfied.", "specialities": ["Dairy / Milk Powder"], "updated_at": "2026-06-06T10:47:06.767Z"},
        {"id": "zoUW2YMSlK6bUfvzPKfb", "name": "Florencia", "company": "El Bahiense", "title": "Sales Manager", "email": "", "phone": "", "whatsapp": "+54 9 11 3685-2251", "country": "Argentina", "status": "No Fit", "supplier_id": "el_bahiense_argentina", "contact_method": "WhatsApp", "last_contacted": "2026-05-27", "notes": "Distributors only, not producers. E1422 viscosity too low.", "specialities": ["General Ingredients"], "updated_at": "2026-05-28T19:26:20.796Z", "created_at": "2026-05-27T12:55:02.292Z"},
    ]

    seed_all(suppliers_hc, buyers, CONTACTS_FROM_FIRESTORE, ingredient_flows, product_intel, trade_flows)
else:
    print("\nTo seed data after creating tables, run:")
    print("  python supabase_setup.py --seed")
