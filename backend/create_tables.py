"""
create_tables.py — Create Supabase tables via the Management API
================================================================
Run once:  python create_tables.py
Uses the service-role key (SUPABASE_KEY) to execute DDL directly
through the Supabase REST SQL endpoint.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("ERROR: SUPABASE_URL or SUPABASE_KEY not set in backend/.env")

# Extract project ref from URL
PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0]
SQL_ENDPOINT = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

DDL_STATEMENTS = [
    # --- dairy_products ---
    """
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
    """,
    # --- materials ---
    """
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
    """,
    # --- manufacturers ---
    """
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
    """,
]

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def run_sql(sql: str, label: str):
    body = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(SQL_ENDPOINT, data=body, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            print(f"  ✅  Table '{label}' created / already exists")
            return True
    except urllib.error.HTTPError as e:
        body_err = e.read().decode(errors="replace")
        # 400 with "already exists" is fine
        if "already exists" in body_err:
            print(f"  ✅  Table '{label}' already exists (skipped)")
            return True
        print(f"  ❌  HTTP {e.code} for '{label}': {body_err[:300]}")
        return False
    except Exception as e:
        print(f"  ❌  Error for '{label}': {e}")
        return False


if __name__ == "__main__":
    print(f"\n[Verde 2.0] Creating tables on project: {PROJECT_REF}")
    labels = ["dairy_products", "materials", "manufacturers"]
    ok = all(run_sql(sql, lbl) for sql, lbl in zip(DDL_STATEMENTS, labels))
    if ok:
        print("\n  All tables ready -- run migrate_to_supabase.py next.\n")
        sys.exit(0)
    else:
        print("\n  WARNING: Some tables failed -- see errors above.\n")
        sys.exit(1)
