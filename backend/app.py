"""
app.py — Flask Application Entry Point & Route Definitions
===========================================================
Exposes:
  GET  /api/products              → list all dairy products (for dropdown)
  GET  /api/products/<id>         → single product details
  GET  /api/materials             → list all packaging materials
  POST /api/recommend             → run the matching engine
  POST /api/sourcing              → find & rank suppliers for a material
  GET  /api/health                → liveness probe
"""

from flask import Flask, jsonify, request, abort
from flask_cors import CORS

from services.engine import recommend, get_all_products
from services.sourcing import find_suppliers
from repository.json_db import JsonDB

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

_db = JsonDB()

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get('/api/health')
def health():
    return jsonify({'status': 'ok'})

# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

@app.get('/api/products')
def list_products():
    """Return all dairy products (used to populate the product dropdown)."""
    return jsonify(get_all_products())


@app.get('/api/products/<product_id>')
def get_product(product_id: str):
    """Return a single dairy product by ID."""
    product = _db.get_dairy_product_by_id(product_id)
    if product is None:
        abort(404, description=f"Product '{product_id}' not found.")
    return jsonify(product)

# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

@app.get('/api/materials')
def list_materials():
    """Return all packaging materials."""
    return jsonify(_db.get_all_packaging_materials())

# ---------------------------------------------------------------------------
# Recommendation Engine
# ---------------------------------------------------------------------------

@app.post('/api/recommend')
def run_recommendation():
    """
    Request body (JSON):
    {
        "product_id":      "whole_milk",   # required
        "max_moq":         10000,          # optional int  — used as user_moq for sourcing
        "max_cost":        0.50,           # optional float
        "recyclable_only": false           # optional bool
    }

    Response shape (aligned with ResultsDash.jsx):
    {
        "product":      <dairy product dict>,
        "best_pick":    { ...material fields, badge: "Best Pick"   },
        "budget_pick":  { ...material fields, badge: "Budget Choice" },
        "premium_pick": { ...material fields, badge: "Premium Choice" },
        "suppliers":    [ { id, name, tier, location, moq_kg, lead_time_days, score, ... } ],
        "failure_matrix": [ <rejected material dicts with failure_reasons> ]
    }
    """
    body = request.get_json(silent=True) or {}

    product_id = body.get('product_id')
    if not product_id:
        abort(400, description="'product_id' is required.")

    user_moq = body.get('max_moq')

    try:
        engine_result = recommend(
            product_id,
            max_moq=user_moq,
            max_cost=body.get('max_cost'),
            recyclable_only=bool(body.get('recyclable_only', False)),
        )
    except ValueError as exc:
        abort(404, description=str(exc))

    matches = engine_result.get('matches', [])

    if not matches:
        return jsonify({
            'product':      engine_result['product'],
            'best_pick':    None,
            'budget_pick':  None,
            'premium_pick': None,
            'suppliers':    [],
            'failure_matrix': engine_result.get('failures', []),
        })

    # ── Derive the three picks ──────────────────────────────────────────────
    # best_pick  : highest composite score (engine already sorted desc by score)
    best_raw = matches[0]

    # budget_pick : lowest cost_per_unit; picks a distinct material if available
    other_matches = [m for m in matches if m['id'] != best_raw['id']]
    if other_matches:
        budget_raw = min(other_matches, key=lambda m: m.get('cost_per_unit', 9999))
    else:
        budget_raw = best_raw

    # premium_pick: longest shelf life / highest protective barrier
    third_matches = [m for m in other_matches if m['id'] != budget_raw['id']]
    if third_matches:
        premium_raw = max(third_matches, key=lambda m: (m.get('shelf_life_extension_days', 0), -m.get('otr_value_cc_m2_day', 9999)))
    elif other_matches:
        premium_raw = max(other_matches, key=lambda m: (m.get('shelf_life_extension_days', 0), -m.get('otr_value_cc_m2_day', 9999)))
    else:
        premium_raw = best_raw

    def _map_material(mat, badge, failure_risks):
        return {
            'id':                        mat['id'],
            'name':                      mat['name'],
            'description':               mat.get('description', ''),
            'material_type':             mat.get('material_type', ''),
            'category':                  mat.get('category', ''),
            'otr':                       mat.get('otr_value_cc_m2_day', mat.get('OTR_limit')),
            'wvtr':                      mat.get('wvtr_value_g_m2_day', mat.get('WVTR_limit')),
            'is_recyclable':             mat.get('recyclable', mat.get('epr_compliant', True)),
            'cost_per_kg':               mat.get('cost_per_unit', 0.50),
            'ph_range':                  mat.get('pH_range'),
            'compatible_phase_states':   mat.get('compatible_phase_states', []),
            'shelf_life_extension_days': mat.get('shelf_life_extension_days'),
            'compostability':            mat.get('compostability', ''),
            'bio_source':                mat.get('bio_source', ''),
            'image_url':                 mat.get('image_url'),
            'score':                     mat.get('score'),
            'badge':                     badge,
            'failure_risks':             failure_risks,
        }

    product = engine_result['product']
    best_pick    = _map_material(best_raw,    'Best Pick',      _generate_failure_risks(best_raw, product))
    budget_pick  = _map_material(budget_raw,  'Budget Choice',  _generate_failure_risks(budget_raw, product))
    premium_pick = _map_material(premium_raw, 'Premium Choice', _generate_failure_risks(premium_raw, product))

    # Keep backward-compat key pointing to best_pick so old consumers don't break
    recommended_material = best_pick

    # --- Auto-fetch suppliers for the best-pick material ---
    try:
        sourcing_result = find_suppliers(
            best_raw['id'],
            user_moq=int(user_moq) if user_moq else None,
        )
        raw_suppliers = sourcing_result.get('matches', [])
    except Exception:
        raw_suppliers = []

    suppliers = [
        {
            'id':             s['id'],
            'name':           s['name'],
            'tier':           f"Tier {s['tier']}",
            'location':       f"{s.get('city', '')}, {s.get('country', '')}",
            'moq_kg':         s.get('moq'),
            'lead_time_days': s.get('lead_time_days'),
            'score':          s.get('score'),
            'certifications': s.get('certifications', []),
            'contact_email':  s.get('contact_email', ''),
            'website':        s.get('website', ''),
        }
        for s in raw_suppliers
    ]

    return jsonify({
        'product':              product,
        'best_pick':            best_pick,
        'budget_pick':          budget_pick,
        'premium_pick':         premium_pick,
        'recommended_material': recommended_material,   # backward-compat alias
        'suppliers':            suppliers,
        'failure_matrix':       engine_result.get('failures', []),
    })


def _generate_failure_risks(material: dict, product: dict) -> list[dict]:
    """Derive human-readable failure risk cards from material & product properties."""
    risks = []

    # 1. Use the curated failure modes from the dataset if present
    failure_modes = material.get('failure_modes', {})
    if isinstance(failure_modes, dict) and failure_modes:
        for mode_key, mode_desc in failure_modes.items():
            risks.append({
                'type': mode_key.replace('_', ' ').title(),
                'desc': mode_desc,
            })

    # 2. Add product-specific risks if not already covered
    if product.get('temperature_sensitivity') == 'high' and not any('Temp' in r['type'] for r in risks):
        risks.append({
            'type': 'Cold-Chain Deviation',
            'desc': (
                f"{product['name']} is highly temperature-sensitive. "
                f"Storage above designated cold-chain thresholds will accelerate microbial activity."
            ),
        })

    if not risks:
        risks.append({
            'type': 'Seal Integrity Validation',
            'desc': (
                f"Ensure heat-sealing temperature, pressure, and dwell time are calibrated "
                f"for {material['name']} on your filling line."
            ),
        })

    return risks



# ---------------------------------------------------------------------------
# Sourcing
# ---------------------------------------------------------------------------

@app.post('/api/sourcing')
def run_sourcing():
    """
    Request body (JSON):
    {
        "material_id": "multilayer_pouch",  # required
        "user_moq":    10000,               # optional int — your order quantity
        "max_tier":    2                    # optional int — 1=best, 3=lowest
    }
    """
    body = request.get_json(silent=True) or {}

    material_id = body.get('material_id')
    if not material_id:
        abort(400, description="'material_id' is required.")

    try:
        result = find_suppliers(
            material_id,
            user_moq=body.get('user_moq'),
            max_tier=body.get('max_tier'),
        )
    except ValueError as exc:
        abort(404, description=str(exc))

    return jsonify(result)

# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------

@app.errorhandler(400)
@app.errorhandler(404)
def http_error(err):
    return jsonify({'error': err.description}), err.code


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True, port=5000)
