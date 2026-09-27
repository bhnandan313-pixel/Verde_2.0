"""
diagnose.py  -  Trace why recommend() returns 0 matches from Supabase
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from repository.supabase_db import SupabaseDB
from services.engine import recommend

# --- 1. Raw DB call ---
db = SupabaseDB()
mats = db.get_all_packaging_materials()
print(f"get_all_packaging_materials() -> {len(mats)} items")

if mats:
    m0 = mats[0]
    print(f"First material keys     : {list(m0.keys())}")
    cps = m0.get("compatible_phase_states")
    print(f"compatible_phase_states : {cps!r}  (type={type(cps).__name__})")
    print(f"pH_range                : {m0.get('pH_range')!r}")
    print(f"OTR_limit               : {m0.get('OTR_limit')!r}")
    print(f"otr_value_cc_m2_day     : {m0.get('otr_value_cc_m2_day')!r}")
    print(f"max_moisture_exposure   : {m0.get('max_moisture_exposure')!r}")
    print(f"supported_storage_types : {m0.get('supported_storage_types')!r}")
else:
    print("WARNING: materials list is EMPTY")

# --- 2. Single product ---
print()
prod = db.get_dairy_product_by_id("paneer")
if prod:
    print(f"paneer keys        : {list(prod.keys())}")
    print(f"phase_state        : {prod.get('phase_state')!r}")
    print(f"pH key 'pH'        : {prod.get('pH')!r}")
    print(f"pH key 'ph'        : {prod.get('ph')!r}")
    print(f"moisture_content   : {prod.get('moisture_content')!r}")
    print(f"required_OTR       : {prod.get('required_OTR')!r}")
    print(f"required_otr       : {prod.get('required_otr')!r}")
else:
    print("WARNING: paneer not found")

# --- 3. Full engine call ---
print()
result = recommend("paneer", storage_type="Transport", temperature_condition="Chilled Storage")
print(f"recommend() matches  : {len(result['matches'])}")
print(f"recommend() failures : {len(result['failures'])}")
if result["failures"]:
    print(f"First failure reasons: {result['failures'][0].get('failure_reasons')}")
