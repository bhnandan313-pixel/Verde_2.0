"""
sourcing.py — Supplier Sourcing & Tier-Matching Logic
======================================================
Given a packaging material ID and an optional user MOQ, this module:
  1. Filters manufacturers whose compatible_material_ids includes the material.
  2. Applies the MOQ constraint — supplier MOQ must be <= user's required quantity
     (i.e. supplier can fulfil the order).  If user_moq is None, all pass.
  3. Scores each supplier by a weighted composite:
       score = w_cost * (1 - cost_index)    # lower cost_index → higher score
             + w_tier * tier_score          # Tier 1 best → mapped to [0,1]
             + w_lead * lead_score          # shorter lead time → higher score
  4. Returns matched suppliers sorted best-first, plus rejected ones with reasons.
"""

from __future__ import annotations
from repository.json_db import JsonDB

_db = JsonDB()

# Scoring weights (must sum to 1.0)
WEIGHTS = {
    'cost': 0.45,
    'tier': 0.35,
    'lead': 0.20,
}

_MAX_TIER = 3          # Tier 1 is best; normalise against this
_MAX_LEAD = 30         # Days — used to normalise lead time score


def _score(supplier: dict) -> float:
    cost_score = 1.0 - supplier.get('cost_index', 1.0)
    tier_score = 1.0 - (supplier.get('tier', _MAX_TIER) - 1) / (_MAX_TIER - 1)
    lead_days  = supplier.get('lead_time_days', _MAX_LEAD)
    lead_score = 1.0 - min(lead_days / _MAX_LEAD, 1.0)

    return (
        WEIGHTS['cost'] * cost_score
        + WEIGHTS['tier'] * tier_score
        + WEIGHTS['lead'] * lead_score
    )


def find_suppliers(
    material_id: str,
    *,
    user_moq: int | None = None,
    max_tier: int | None = None,
) -> dict:
    """
    Find and rank suppliers for a given packaging material.

    Parameters
    ----------
    material_id : Packaging material ID (must exist in packaging_materials.json).
    user_moq    : The quantity the user intends to order. Suppliers whose MOQ
                  exceeds this are rejected.  Pass None to skip this filter.
    max_tier    : Optional ceiling on supplier tier (1 = best).

    Returns
    -------
    {
        "material":  <material dict>,
        "matches":   [<scored & sorted supplier dicts>],
        "rejected":  [<rejected supplier dicts with 'rejection_reasons' list>],
    }
    """
    material = _db.get_packaging_material_by_id(material_id)
    if material is None:
        raise ValueError(f"Unknown material id: '{material_id}'")

    all_manufacturers = _db.get_all_manufacturers()

    matches: list[dict] = []
    rejected: list[dict] = []

    for mfr in all_manufacturers:
        reasons: list[str] = []

        # Hard filter 1 — material compatibility
        if material_id not in mfr.get('compatible_material_ids', []):
            reasons.append(
                f"Does not supply '{material_id}'"
            )

        # Hard filter 2 — MOQ feasibility
        if user_moq is not None and mfr.get('moq', 0) > user_moq:
            reasons.append(
                f"Supplier MOQ {mfr['moq']:,} exceeds your order quantity {user_moq:,}"
            )

        # Optional filter 3 — tier ceiling
        if max_tier is not None and mfr.get('tier', 99) > max_tier:
            reasons.append(
                f"Tier {mfr['tier']} exceeds requested max tier {max_tier}"
            )

        if reasons:
            rejected.append({**mfr, 'rejection_reasons': reasons})
        else:
            score = _score(mfr)
            matches.append({**mfr, 'score': round(score, 4)})

    matches.sort(key=lambda s: s['score'], reverse=True)

    return {
        'material': material,
        'matches':  matches,
        'rejected': rejected,
    }
