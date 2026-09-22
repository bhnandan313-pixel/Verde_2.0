"""
engine.py — Deterministic Packaging Recommendation Engine
==========================================================
Matching algorithm:
  1. Filter candidate materials whose compatible_phase_states includes the
     product's phase_state.
  2. Filter by storage_type (e.g. Temporary Storage, Long-Term Storage, Transport, Retail Display).
  3. Filter by temperature_condition (e.g. Chilled Storage, Ambient Storage, Frozen Storage).
  4. Filter by pH_range covering the product's pH.
  5. Filter by max_moisture_exposure >= product's moisture_content.
  6. Apply optional user constraints (MOQ ceiling, max cost, recyclable-only).
  7. Score remaining candidates by a weighted multi-criteria composite:
       - Barrier efficiency (lower OTR/WVTR = stronger barrier protection)
       - Shelf life extension capacity
       - Cost-effectiveness (lower cost_per_unit / cost_index)
       - Dairy application affinity (prioritises materials formulated for this specific commodity)
       - Storage and thermal regime suitability
  8. Annotate each rejected candidate with specific reasons for the Failure Matrix.
  9. Sort descending by score.
"""

from __future__ import annotations

import math
from repository.json_db import JsonDB


def _score(
    material: dict,
    product: dict,
    storage_type: str | None = None,
    temperature_condition: str | None = None,
) -> float:
    """Compute a normalised composite score for a material–product pair."""
    # Cost score: 1.0 (lowest cost) to 0.1 (high cost)
    cost_index = material.get('cost_index_per_kg', 5)
    cost_score = (11.0 - min(cost_index, 10.0)) / 10.0

    # Barrier capability: lower OTR & WVTR means stronger barrier
    otr = max(material.get('otr_value_cc_m2_day', material.get('OTR_limit', 1.0)), 0.1)
    wvtr = max(material.get('wvtr_value_g_m2_day', material.get('WVTR_limit', 1.0)), 0.1)
    # Logarithmic barrier index (higher score for lower transmission rates)
    barrier_score = 1.0 / (1.0 + math.log10(otr * wvtr) / 6.0)

    # Shelf life extension: 2 to 30 days
    shelf_days = material.get('shelf_life_extension_days', 5)
    shelf_score = min(shelf_days / 30.0, 1.0)

    # Application affinity: check if the product matches explicitly declared applications
    app_affinity = 0.0
    prod_tokens = set(product['id'].lower().split('_') + product['name'].lower().split())
    for app in material.get('dairy_applications', []):
        app_words = set(app.lower().split())
        if prod_tokens & app_words:
            app_affinity = 0.20
            break

    # Barrier fit: bonus if material transmission rate is comfortably below product tolerance
    barrier_fit = 0.0
    req_otr = product.get('required_OTR', 50.0)
    req_wvtr = product.get('required_WVTR', 10.0)
    if otr <= req_otr * 1.5:
        barrier_fit += 0.05
    if wvtr <= req_wvtr * 1.5:
        barrier_fit += 0.05

    # Storage suitability bonus
    storage_bonus = 0.0
    if storage_type and storage_type in material.get('supported_storage_types', []):
        storage_bonus += 0.05

    # Temperature suitability bonus
    temp_bonus = 0.0
    if temperature_condition and temperature_condition in material.get('supported_temperature_conditions', []):
        temp_bonus += 0.05

    total = (
        0.25 * barrier_score
        + 0.20 * shelf_score
        + 0.20 * cost_score
        + 0.15 * app_affinity
        + 0.05 * barrier_fit
        + 0.10 * (storage_bonus + temp_bonus)
    )
    return round(total, 4)


def recommend(
    product_id: str,
    *,
    storage_type: str | None = None,
    temperature_condition: str | None = None,
    max_moq: int | None = None,
    max_cost: float | None = None,
    recyclable_only: bool = False,
) -> dict:
    """
    Run the deterministic matching algorithm for a given dairy product.

    Parameters
    ----------
    product_id            : ID of the dairy product (must exist in dairy_products.json).
    storage_type          : Optional storage purpose (e.g. 'Temporary Storage', 'Long-Term Storage', 'Transport', 'Retail Display').
    temperature_condition : Optional thermal condition (e.g. 'Chilled Storage', 'Ambient Storage', 'Frozen Storage').
    max_moq               : Optional upper bound on minimum order quantity.
    max_cost              : Optional upper bound on cost per unit (USD).
    recyclable_only       : If True, exclude non-recyclable materials.

    Returns
    -------
    {
        "product":   <product dict>,
        "matches":   [<scored & sorted material dicts with 'score' key>],
        "failures":  [<rejected material dicts with 'failure_reasons' list>],
    }
    """
    db = JsonDB()
    product = db.get_dairy_product_by_id(product_id)
    if product is None:
        raise ValueError(f"Unknown product id: '{product_id}'")

    all_materials = db.get_all_packaging_materials()

    matches: list[dict] = []
    failures: list[dict] = []

    for mat in all_materials:
        reasons: list[str] = []

        # 1. Phase state compatibility
        compatible_phases = mat.get('compatible_phase_states', [])
        if product['phase_state'] not in compatible_phases:
            reasons.append(
                f"Phase incompatible: material designed for {compatible_phases}, "
                f"product is '{product['phase_state']}'"
            )

        # 2. Storage type compatibility
        if storage_type and storage_type not in ('Other', 'Any', ''):
            supported_storage = mat.get('supported_storage_types', [])
            if storage_type not in supported_storage:
                reasons.append(
                    f"Storage type incompatible: not rated for '{storage_type}'. "
                    f"Approved for: {', '.join(supported_storage[:3])}"
                )

        # 3. Temperature regime compatibility
        if temperature_condition and temperature_condition not in ('Other', 'Any', ''):
            supported_temps = mat.get('supported_temperature_conditions', [])
            if temperature_condition not in supported_temps:
                reasons.append(
                    f"Temperature incompatible: not certified for '{temperature_condition}'. "
                    f"Approved for: {', '.join(supported_temps)}"
                )

        # 4. pH range check
        ph_min, ph_max = mat.get('pH_range', [0, 14])
        if not (ph_min <= product['pH'] <= ph_max):
            reasons.append(
                f"pH out of range: product pH={product['pH']} not in [{ph_min}, {ph_max}]"
            )

        # 5. Moisture exposure check
        max_moisture = mat.get('max_moisture_exposure', 100)
        if max_moisture < product.get('moisture_content', 0):
            reasons.append(
                f"Moisture limit exceeded: material tolerance is {max_moisture}% "
                f"< product moisture={product['moisture_content']}%"
            )

        # 6. Optional user constraints
        if max_moq is not None and mat.get('MOQ', 0) > max_moq:
            reasons.append(f"MOQ {mat['MOQ']:,} exceeds user limit {max_moq:,}")

        if max_cost is not None and mat.get('cost_per_unit', 0) > max_cost:
            reasons.append(
                f"Cost ${mat['cost_per_unit']:.2f} exceeds user limit ${max_cost:.2f}"
            )

        if recyclable_only and not (mat.get('recyclable', False) or mat.get('epr_compliant', False)):
            reasons.append("Material is not EPR / recyclable certified")

        # Route to match or failure
        if reasons:
            failures.append({**mat, 'failure_reasons': reasons})
        else:
            score = _score(mat, product, storage_type, temperature_condition)
            matches.append({**mat, 'score': score})

    # Sort matches best-first
    matches.sort(key=lambda m: m['score'], reverse=True)

    return {
        'product': product,
        'matches': matches,
        'failures': failures,
    }


def get_all_products() -> list[dict]:
    """Convenience wrapper — returns all dairy products for dropdown population."""
    return JsonDB().get_all_dairy_products()
