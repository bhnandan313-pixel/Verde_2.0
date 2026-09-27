"""
migrate_to_supabase.py  --  One-shot JSON -> Supabase migration + logic check
==============================================================================
Run from the backend/ directory:
    python migrate_to_supabase.py

What this script does
---------------------
1.  Connect to Supabase Postgres directly (psycopg2) and CREATE the three
    tables with IF NOT EXISTS (fully idempotent).
2.  Seed rows from the three JSON files via the Supabase Python client
    (upsert -- safe to re-run).
3.  Run six verification checks covering:
       - Row counts for all three tables
       - Single-row lookup by id
       - Array-column "contains" filter (phase state)
       - Array-column "contains" filter (manufacturer -> material)
       - Full engine recommend() round-trip
       - Full sourcing find_suppliers() round-trip
"""

import json
import os
import sys
from pathlib import Path

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("ERROR: SUPABASE_URL or SUPABASE_KEY not set in backend/.env")

# Derive direct Postgres DSN from project URL
# URL format:  https://<ref>.supabase.co
PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0]
PG_DSN = (
    f"postgresql://postgres.{PROJECT_REF}:{SUPABASE_KEY}"
    f"@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
DATA_DIR = Path(__file__).parent / "data"

# ---------------------------------------------------------------------------
# DDL
# ---------------------------------------------------------------------------
DDL = """
CREATE TABLE IF NOT EXISTS dairy_products (
    id                      TEXT PRIMARY KEY,
    name                    TEXT NOT NULL,
    commodity_id            TEXT,
    phase_state             TEXT NOT NULL,
    fat_content_level       TEXT,
    barrier_class           TEXT,
    moisture_content        FLOAT,
    "pH"                    FLOAT,
    required_otr            FLOAT,
    required_wvtr           FLOAT,
    temperature_sensitivity TEXT,
    shelf_life_days         INTEGER
);

CREATE TABLE IF NOT EXISTS materials (
    id                               TEXT PRIMARY KEY,
    material_id                      TEXT,
    name                             TEXT NOT NULL,
    category                         TEXT,
    material_type                    TEXT,
    otr_value_cc_m2_day              FLOAT,
    wvtr_value_g_m2_day              FLOAT,
    "OTR_limit"                      FLOAT,
    "WVTR_limit"                     FLOAT,
    cost_index_per_kg                INTEGER,
    cost_per_unit                    FLOAT,
    "MOQ"                            INTEGER,
    epr_compliant                    BOOLEAN DEFAULT false,
    recyclable                       BOOLEAN DEFAULT false,
    compostability                   TEXT,
    is_bioplastic                    BOOLEAN DEFAULT false,
    bio_source                       TEXT,
    compatible_phase_states          TEXT[],
    dairy_applications               TEXT[],
    supported_storage_types          TEXT[],
    supported_temperature_conditions TEXT[],
    shelf_life_extension_days        INTEGER,
    max_moisture_exposure            FLOAT,
    "pH_range"                       FLOAT[],
    description                      TEXT,
    image_url                        TEXT,
    failure_modes                    JSONB
);

CREATE TABLE IF NOT EXISTS manufacturers (
    id                      TEXT PRIMARY KEY,
    name                    TEXT NOT NULL,
    country                 TEXT,
    city                    TEXT,
    lat                     FLOAT,
    lon                     FLOAT,
    tier                    INTEGER,
    moq                     INTEGER,
    lead_time_days          INTEGER,
    certifications          TEXT[],
    compatible_material_ids TEXT[],
    cost_index              FLOAT,
    contact_email           TEXT,
    website                 TEXT
);
"""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def log_ok(msg):  print(f"  [OK]   {msg}")
def log_fail(msg): print(f"  [FAIL] {msg}")
def section(title): print(f"\n{'='*60}\n  {title}\n{'='*60}")


def load_json(filename):
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Flatten helpers -- map JSON keys to exact column names
# ---------------------------------------------------------------------------
def flat_product(p):
    return {
        "id": p["id"], "name": p["name"],
        "commodity_id": p.get("commodity_id"),
        "phase_state": p["phase_state"],
        "fat_content_level": p.get("fat_content_level"),
        "barrier_class": p.get("barrier_class"),
        "moisture_content": p.get("moisture_content"),
        "pH": p.get("pH"),
        "required_otr": p.get("required_OTR"),
        "required_wvtr": p.get("required_WVTR"),
        "temperature_sensitivity": p.get("temperature_sensitivity"),
        "shelf_life_days": p.get("shelf_life_days"),
    }


def flat_material(m):
    return {
        "id": m["id"],
        "material_id": m.get("material_id"),
        "name": m["name"],
        "category": m.get("category"),
        "material_type": m.get("material_type"),
        "otr_value_cc_m2_day": m.get("otr_value_cc_m2_day"),
        "wvtr_value_g_m2_day": m.get("wvtr_value_g_m2_day"),
        "OTR_limit": m.get("OTR_limit"),
        "WVTR_limit": m.get("WVTR_limit"),
        "cost_index_per_kg": m.get("cost_index_per_kg"),
        "cost_per_unit": m.get("cost_per_unit"),
        "MOQ": m.get("MOQ"),
        "epr_compliant": m.get("epr_compliant", False),
        "recyclable": m.get("recyclable", False),
        "compostability": m.get("compostability"),
        "is_bioplastic": m.get("is_bioplastic", False),
        "bio_source": m.get("bio_source"),
        "compatible_phase_states": m.get("compatible_phase_states", []),
        "dairy_applications": m.get("dairy_applications", []),
        "supported_storage_types": m.get("supported_storage_types", []),
        "supported_temperature_conditions": m.get("supported_temperature_conditions", []),
        "shelf_life_extension_days": m.get("shelf_life_extension_days"),
        "max_moisture_exposure": m.get("max_moisture_exposure"),
        "pH_range": m.get("pH_range"),
        "description": m.get("description"),
        "image_url": (m.get("image_url") or "").strip(),
        "failure_modes": m.get("failure_modes"),
    }


def flat_mfr(mfr):
    return {
        "id": mfr["id"], "name": mfr["name"],
        "country": mfr.get("country"), "city": mfr.get("city"),
        "lat": mfr.get("lat"), "lon": mfr.get("lon"),
        "tier": mfr.get("tier"), "moq": mfr.get("moq"),
        "lead_time_days": mfr.get("lead_time_days"),
        "certifications": mfr.get("certifications", []),
        "compatible_material_ids": mfr.get("compatible_material_ids", []),
        "cost_index": mfr.get("cost_index"),
        "contact_email": mfr.get("contact_email"),
        "website": mfr.get("website"),
    }


# ---------------------------------------------------------------------------
# Step 1 -- Create tables via direct psycopg2 connection
# ---------------------------------------------------------------------------
def create_tables():
    section("Step 1 -- Creating tables (psycopg2 direct connection)")
    try:
        conn = psycopg2.connect(PG_DSN, connect_timeout=15)
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute(DDL)
        conn.close()
        log_ok("All three tables created / already exist")
        return True
    except Exception as e:
        log_fail(f"DDL failed: {e}")
        print()
        print("  Manual fallback: paste the SQL below into the Supabase Dashboard")
        print("  (SQL Editor -> New query -> Run):")
        print()
        print(DDL)
        return False


# ---------------------------------------------------------------------------
# Step 2 -- Seed data via Supabase client (upsert)
# ---------------------------------------------------------------------------
def seed(table, records):
    try:
        resp = supabase.table(table).upsert(records, on_conflict="id").execute()
        inserted = len(resp.data) if resp.data else 0
        log_ok(f"'{table}' -- upserted {inserted} rows")
    except Exception as e:
        log_fail(f"'{table}' seeding failed: {e}")
        raise


def seed_all():
    section("Step 2 -- Seeding data")
    products      = [flat_product(p)   for p in load_json("dairy_products.json")]
    materials_raw = [flat_material(m)  for m in load_json("packaging_materials.json")]
    manufacturers = [flat_mfr(f)       for f in load_json("manufacturers.json")]

    seed("dairy_products",  products)
    seed("materials",       materials_raw)
    seed("manufacturers",   manufacturers)


# ---------------------------------------------------------------------------
# Step 3 -- Verify logic
# ---------------------------------------------------------------------------
def verify():
    section("Step 3 -- Logic Verification")
    errors = 0

    # 3a -- Row counts
    for table, expected in [("dairy_products", 10), ("materials", 10), ("manufacturers", 8)]:
        try:
            resp = supabase.table(table).select("id", count="exact").execute()
            count = resp.count if resp.count is not None else len(resp.data)
            if count == expected:
                log_ok(f"'{table}' row count: {count} / {expected}")
            else:
                log_fail(f"'{table}' row count: {count} (expected {expected})")
                errors += 1
        except Exception as e:
            log_fail(f"count('{table}'): {e}")
            errors += 1

    # 3b -- Single product lookup
    try:
        resp = supabase.table("dairy_products").select("*").eq("id", "paneer").limit(1).execute()
        if resp.data and resp.data[0]["id"] == "paneer":
            log_ok("get_dairy_product_by_id('paneer') -- found")
        else:
            log_fail("get_dairy_product_by_id('paneer') -- NOT found")
            errors += 1
    except Exception as e:
        log_fail(f"product-by-id: {e}"); errors += 1

    # 3c -- Phase-state array filter
    try:
        resp = supabase.table("materials").select("id,name").contains("compatible_phase_states", ["solid"]).execute()
        names = [r["name"] for r in resp.data]
        if names:
            log_ok(f"Phase filter 'solid' -- {len(names)} materials: {names}")
        else:
            log_fail("Phase filter 'solid' -- 0 results"); errors += 1
    except Exception as e:
        log_fail(f"phase-state filter: {e}"); errors += 1

    # 3d -- Manufacturer-material array filter
    try:
        resp = supabase.table("manufacturers").select("id,name").contains("compatible_material_ids", ["M004"]).execute()
        names = [r["name"] for r in resp.data]
        if names:
            log_ok(f"Manufacturers for M004 -- {len(names)}: {names}")
        else:
            log_fail("Manufacturers for M004 -- 0 results"); errors += 1
    except Exception as e:
        log_fail(f"manufacturer-for-material: {e}"); errors += 1

    # 3e -- Full engine recommend() round-trip
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from services.engine import recommend
        result = recommend("paneer", storage_type="Transport", temperature_condition="Chilled Storage")
        matches  = result.get("matches", [])
        failures = result.get("failures", [])
        if matches:
            top = matches[0]
            log_ok(f"recommend('paneer') -- {len(matches)} matches, {len(failures)} rejections")
            log_ok(f"  Best Pick: {top['name']}  (score={top['score']})")
        else:
            log_fail("recommend('paneer') -- 0 matches"); errors += 1
    except Exception as e:
        log_fail(f"engine.recommend(): {e}"); errors += 1

    # 3f -- Full sourcing find_suppliers() round-trip
    try:
        from services.sourcing import find_suppliers
        result  = find_suppliers("M004")
        matches = result.get("matches", [])
        if matches:
            log_ok(f"find_suppliers('M004') -- {len(matches)} supplier(s): {[m['name'] for m in matches]}")
        else:
            log_fail("find_suppliers('M004') -- 0 suppliers"); errors += 1
    except Exception as e:
        log_fail(f"sourcing.find_suppliers(): {e}"); errors += 1

    section("Result")
    if errors == 0:
        print("  ALL CHECKS PASSED -- Supabase backend is fully operational!")
    else:
        print(f"  {errors} CHECK(S) FAILED -- review errors above.")
    return errors


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("\n[Verde 2.0] Supabase Migration + Logic Verification")
    print(f"  Project: {PROJECT_REF}")
    print(f"  Data dir: {DATA_DIR.resolve()}")

    ddl_ok = create_tables()
    seed_all()
    errs = verify()
    sys.exit(0 if errs == 0 else 1)
