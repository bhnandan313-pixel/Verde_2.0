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

    # budget_pick : cheapest cost_per_unit; falls back to best if only 1 match
    budget_raw = min(matches, key=lambda m: m.get('cost_per_unit', 9999))

    # premium_pick: highest total barrier headroom (OTR_limit + WVTR_limit)
    #               represents the most protective / premium option
    premium_raw = max(matches, key=lambda m: m.get('OTR_limit', 0) + m.get('WVTR_limit', 0))

    def _map_material(mat, badge, failure_risks):
        return {
            'id':            mat['id'],
            'name':          mat['name'],
            'description':   mat.get('description', ''),
            'material_type': mat.get('material_type', ''),
            'otr':           mat.get('OTR_limit'),
            'wvtr':          mat.get('WVTR_limit'),
            'is_recyclable': mat.get('recyclable', False),
            'cost_per_kg':   mat.get('cost_per_unit'),
            'ph_range':      mat.get('pH_range'),
            'compatible_phase_states': mat.get('compatible_phase_states', []),
            'score':         mat.get('score'),
            'badge':         badge,
            'failure_risks': failure_risks,
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

    temp_sensitivity = product.get('temperature_sensitivity', 'medium')
    if temp_sensitivity == 'high':
        risks.append({
            'type': 'Temperature Deviation',
            'desc': (
                f"This product is highly temperature-sensitive. "
                f"If the {material['name']} is exposed to temperatures above the cold-chain "
                f"threshold, off-gassing will compromise barrier integrity."
            ),
        })

    if material.get('OTR_limit', 100) < 10:
        risks.append({
            'type': 'Physical Impact / Micro-puncture',
            'desc': (
                "High-barrier films are susceptible to micro-punctures from sharp impacts. "
                "A single pinhole breaks the hermetic seal and accelerates spoilage."
            ),
        })

    if product.get('moisture_content', 0) > 75:
        risks.append({
            'type': 'Moisture Migration',
            'desc': (
                f"With {product.get('moisture_content')}% moisture content, "
                "condensation inside the pack can delaminate multi-layer films "
                "if the WVTR budget is exceeded during distribution."
            ),
        })

    ph = product.get('pH', 7)
    ph_min, ph_max = material.get('pH_range', [0, 14])
    if ph <= 4.5:
        risks.append({
            'type': 'Acid-Induced Degradation',
            'desc': (
                f"Product pH {ph} is acidic. Prolonged contact with the inner "
                "film surface can cause acid migration, affecting taste and "
                "potentially weakening seal strength over time."
            ),
        })

    if not risks:
        risks.append({
            'type': 'Seal Integrity',
            'desc': (
                "Ensure heat-seal parameters (temperature, pressure, dwell time) "
                "are validated on your filling line. Incorrect seal settings are "
                "the most common failure mode for this material format."
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
