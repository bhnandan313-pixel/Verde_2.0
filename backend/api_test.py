"""
api_test.py -- Full API logic test against the live Flask + Supabase backend
"""
import sys
import json
import urllib.request

BASE = "http://127.0.0.1:5000"
PASS_COUNT = 0
FAIL_COUNT = 0


def section(title):
    print(f"\n{'='*55}")
    print(f"  {title}")
    print('='*55)


def ok(msg):
    global PASS_COUNT
    PASS_COUNT += 1
    print(f"  [PASS] {msg}")


def fail(msg):
    global FAIL_COUNT
    FAIL_COUNT += 1
    print(f"  [FAIL] {msg}")


def get(path):
    req = urllib.request.Request(f"{BASE}{path}")
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


# ------------------------------------------------------------------
# 1. Health check
# ------------------------------------------------------------------
section("GET /api/health")
try:
    d = get("/api/health")
    if d.get("status") == "ok":
        ok("status = ok")
    else:
        fail(f"unexpected response: {d}")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 2. Products list (should come from Supabase dairy_products table)
# ------------------------------------------------------------------
section("GET /api/products  -- expects 10 rows from Supabase")
try:
    d = get("/api/products")
    if isinstance(d, list) and len(d) == 10:
        ok(f"{len(d)} products returned from Supabase")
        ids = [p["id"] for p in d]
        ok(f"IDs: {ids}")
    else:
        fail(f"Expected 10, got {len(d) if isinstance(d, list) else type(d).__name__}")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 3. Single product lookup
# ------------------------------------------------------------------
section("GET /api/products/paneer")
try:
    d = get("/api/products/paneer")
    if d.get("id") == "paneer":
        ok(f"paneer: phase={d['phase_state']}, pH={d['pH']}, moisture={d['moisture_content']}%")
    else:
        fail(f"unexpected: {d}")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 4. Materials list
# ------------------------------------------------------------------
section("GET /api/materials  -- expects 10 rows from Supabase")
try:
    d = get("/api/materials")
    if isinstance(d, list) and len(d) == 10:
        ok(f"{len(d)} materials returned from Supabase")
        names = [m["name"] for m in d]
        ok(f"Names: {names}")
    else:
        fail(f"Expected 10, got {len(d) if isinstance(d, list) else type(d).__name__}")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 5a. Recommend: Paneer + Chilled Storage + Transport
# ------------------------------------------------------------------
section("POST /api/recommend  paneer | Chilled Storage | Transport")
try:
    d = post("/api/recommend", {
        "product_id": "paneer",
        "storage_type": "Transport",
        "temperature_condition": "Chilled Storage"
    })
    product      = d.get("product", {})
    best_pick    = d.get("best_pick")
    budget_pick  = d.get("budget_pick")
    premium_pick = d.get("premium_pick")
    failures     = d.get("failure_matrix", [])
    status       = d.get("status", "ok")

    ok(f"Product: {product.get('name')}  phase={product.get('phase_state')}")

    if best_pick:
        ok(f"Best Pick   : {best_pick['name']}  score={best_pick['score']}  ${best_pick.get('cost_per_kg')}")
        ok(f"Budget Pick : {budget_pick['name']}")
        ok(f"Premium Pick: {premium_pick['name']}")
        ok(f"Failure matrix: {len(failures)} rejections")
    else:
        fail(f"No best_pick returned (status={status})")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 5b. Recommend: Whole Milk Powder + Long-Term + Ambient
# ------------------------------------------------------------------
section("POST /api/recommend  whole_milk_powder | Long-Term Storage | Ambient")
try:
    d = post("/api/recommend", {
        "product_id": "whole_milk_powder",
        "storage_type": "Long-Term Storage",
        "temperature_condition": "Ambient Storage"
    })
    best_pick = d.get("best_pick")
    failures  = d.get("failure_matrix", [])
    status    = d.get("status", "ok")
    ok(f"Failure matrix: {len(failures)} rejections")
    if best_pick:
        ok(f"Best Pick: {best_pick['name']}  score={best_pick['score']}")
    else:
        fail(f"No best_pick for whole_milk_powder (status={status})")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 5c. Recommend: Liquid Milk  (fluid -- expects 0 matches, R&D notice)
# ------------------------------------------------------------------
section("POST /api/recommend  liquid_milk  -- expects 0 matches (fluid)")
try:
    d = post("/api/recommend", {"product_id": "liquid_milk"})
    matches  = d.get("matches", [])
    failures = d.get("failures", [])
    if len(matches) == 0:
        ok(f"Correctly returned 0 matches (fluid phase) -- {len(failures)} materials rejected")
    else:
        fail(f"Expected 0 matches for liquid, got {len(matches)}")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 5d. Advanced form: Custom chemistry overrides
# ------------------------------------------------------------------
section("POST /api/recommend  Custom advanced overrides")
try:
    d = post("/api/recommend", {
        "product_id": "cheddar_cheese",
        "product_name": "Artisan Cheddar",
        "storage_type": "Long-Term Storage",
        "temperature_condition": "Chilled Storage",
        "moisture_content": 36.0,
        "fat_content": 33.0,
        "ph_level": 5.1,
        "desired_shelf_life": 180,
        "max_cost": 0.60,
        "recyclable_only": True
    })
    product   = d.get("product", {})
    best_pick = d.get("best_pick")
    status    = d.get("status", "ok")
    ok(f"Product name overridden to: {product.get('name')}")
    if best_pick:
        ok(f"Best Pick: {best_pick['name']}  score={best_pick['score']}")
    else:
        fail(f"No best_pick for custom cheddar (status={status})")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 6. Sourcing: M004 (Metallized PLA)
# ------------------------------------------------------------------
section("POST /api/sourcing  material_id=M004")
try:
    d = post("/api/sourcing", {"material_id": "M004"})
    mat      = d.get("material", {})
    matches  = d.get("matches", [])
    rejected = d.get("rejected", [])
    ok(f"Material resolved: {mat.get('name')}")
    ok(f"Matched suppliers: {len(matches)}   Rejected: {len(rejected)}")
    for s in matches:
        ok(f"  Tier {s['tier']} | {s['name']} | score={s['score']} | lead={s['lead_time_days']}d | cost_idx={s['cost_index']}")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# 7. Sourcing: M001 (Kraft Paper)
# ------------------------------------------------------------------
section("POST /api/sourcing  material_id=M001  (Kraft Paper)")
try:
    d = post("/api/sourcing", {"material_id": "M001"})
    mat     = d.get("material", {})
    matches = d.get("matches", [])
    ok(f"Material resolved: {mat.get('name')}")
    ok(f"Matched suppliers: {len(matches)}")
    if matches:
        ok(f"Top supplier: {matches[0]['name']}  score={matches[0]['score']}")
except Exception as e:
    fail(str(e))

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
print(f"\n{'='*55}")
print(f"  RESULT: {PASS_COUNT} PASSED / {FAIL_COUNT} FAILED")
print('='*55)
sys.exit(0 if FAIL_COUNT == 0 else 1)
