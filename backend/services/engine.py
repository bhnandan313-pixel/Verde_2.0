"""
engine.py — Deterministic Packaging Recommendation Engine
==========================================================
Matching algorithm:
  1. Filter candidate materials whose compatible_phase_states includes the
     product's phase_state.
  2. Filter by OTR_limit  >= product's required_OTR
     and  WVTR_limit >= product's required_WVTR.
  3. Filter by pH_range covering the product's pH.
  4. Filter by max_moisture_exposure >= product's moisture_content.
  5. Apply optional user constraints (MOQ ceiling, max cost, recyclable-only).
  6. Score remaining candidates by a weighted composite:
       score = w_cost * norm_cost + w_otr * otr_margin + w_wvtr * wvtr_margin
     where margins are (limit - required) / limit  (higher = more headroom).
  7. Sort descending by score; annotate each with a failure reason if it was
     rejected, so the caller can build a Failure Matrix.
"""

from __future__ import annotations

from repository.json_db import JsonDB

_db = JsonDB()

# Weight coefficients (must sum to 1.0)
WEIGHTS = {
    'cost': 0.50,
    'otr_margin': 0.25,
    'wvtr_margin': 0.25,
}


def _score(material: dict, product: dict) -> float:
    """Compute a normalised composite score for a material–product pair."""
    # Cost: lower cost → higher score (invert and normalise against $1 ceiling)
    max_cost = 1.0
    cost_score = 1.0 - min(material['cost_per_unit'] / max_cost, 1.0)

    # Barrier margins: excess headroom relative to the limit
    otr_margin = (
        (material['OTR_limit'] - product['required_OTR']) / material['OTR_limit']
        if material['OTR_limit'] > 0 else 1.0
    )
    wvtr_margin = (
        (material['WVTR_limit'] - product['required_WVTR']) / material['WVTR_limit']
        if material['WVTR_limit'] > 0 else 1.0
    )

    return (
        WEIGHTS['cost'] * cost_score
        + WEIGHTS['otr_margin'] * otr_margin
        + WEIGHTS['wvtr_margin'] * wvtr_margin
    )


def recommend(
    product_id: str,
    *,
    max_moq: int | None = None,
    max_cost: float | None = None,
    recyclable_only: bool = False,
) -> dict:
    """
    Run the deterministic matching algorithm for a given dairy product.

    Parameters
    ----------
    product_id      : ID of the dairy product (must exist in dairy_products.json).
    max_moq         : Optional upper bound on minimum order quantity.
    max_cost        : Optional upper bound on cost per unit (USD).
    recyclable_only : If True, exclude non-recyclable materials.

    Returns
    -------
    {
        "product":   <product dict>,
        "matches":   [<scored & sorted material dicts with 'score' key>],
        "failures":  [<rejected material dicts with 'failure_reasons' list>],
    }
    """
    product = _db.get_dairy_product_by_id(product_id)
    if product is None:
        raise ValueError(f"Unknown product id: '{product_id}'")

    all_materials = _db.get_all_packaging_materials()

    matches: list[dict] = []
    failures: list[dict] = []

    for mat in all_materials:
        reasons: list[str] = []

        # --- Hard filters ---
        if product['phase_state'] not in mat.get('compatible_phase_states', []):
            reasons.append(
                f"Phase incompatible: material supports {mat['compatible_phase_states']}, "
                f"product is '{product['phase_state']}'"
            )

        if mat['OTR_limit'] < product['required_OTR']:
            reasons.append(
                f"OTR too high: limit={mat['OTR_limit']} < required={product['required_OTR']}"
            )

        if mat['WVTR_limit'] < product['required_WVTR']:
            reasons.append(
                f"WVTR too high: limit={mat['WVTR_limit']} < required={product['required_WVTR']}"
            )

        ph_min, ph_max = mat.get('pH_range', [0, 14])
        if not (ph_min <= product['pH'] <= ph_max):
            reasons.append(
                f"pH out of range: product pH={product['pH']} not in [{ph_min}, {ph_max}]"
            )

        if mat.get('max_moisture_exposure', 100) < product['moisture_content']:
            reasons.append(
                f"Moisture exposure exceeded: max={mat['max_moisture_exposure']}% "
                f"< product moisture={product['moisture_content']}%"
            )

        # --- Soft / user constraints ---
        if max_moq is not None and mat['MOQ'] > max_moq:
            reasons.append(f"MOQ {mat['MOQ']} exceeds user limit {max_moq}")

        if max_cost is not None and mat['cost_per_unit'] > max_cost:
            reasons.append(
                f"Cost ${mat['cost_per_unit']:.2f} exceeds user limit ${max_cost:.2f}"
            )

        if recyclable_only and not mat.get('recyclable', False):
            reasons.append("Material is not recyclable")

        # --- Route to match or failure ---
        if reasons:
            failures.append({**mat, 'failure_reasons': reasons})
        else:
            score = _score(mat, product)
            matches.append({**mat, 'score': round(score, 4)})

    # Sort matches best-first
    matches.sort(key=lambda m: m['score'], reverse=True)

    return {
        'product': product,
        'matches': matches,
        'failures': failures,
    }


def get_all_products() -> list[dict]:
    """Convenience wrapper — returns all dairy products for dropdown population."""
    return _db.get_all_dairy_products()
