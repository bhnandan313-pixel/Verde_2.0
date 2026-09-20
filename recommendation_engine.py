"""
recommendation_engine.py
━━━━━━━━━━━━━━━━━━━━━━━
Food-packaging recommendation engine for dairy commodities.

Pipeline:
  1. Data Loading          → load commodity + material JSON datasets
  2. Phase & Chemistry Guard → hard-filter by phase compatibility + fat-leach risk
  3. Barrier Guard          → hard-filter by OTR / WVTR thresholds
  4. Multi-Variable Sort    → soft-sort by shelf-life, cost, or EPR compliance
  5. Return                 → top recommendation with failure-mode metadata
"""

import json
import os
from typing import Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
_DIR = os.path.dirname(os.path.abspath(__file__))
_COMMODITIES_PATH = os.path.join(_DIR, "dairy_commodities.json")
_MATERIALS_PATH = os.path.join(_DIR, "material_specs.json")

# Material categories considered "basic plastic" for fat-leach filtering.
# Mono-layer commodity films (LDPE, HDPE) are prone to plasticizer/fat
# migration and scalping at elevated fat concentrations.
_BASIC_PLASTIC_CATEGORIES = {"basic_plastic"}

# Valid priority modes
_VALID_PRIORITIES = {"maximize_shelf_life", "minimize_cost", "epr_compliance"}


# ---------------------------------------------------------------------------
# Data loaders (cached at module level after first call)
# ---------------------------------------------------------------------------
_commodities_cache: Optional[list] = None
_materials_cache: Optional[list] = None


def _load_commodities() -> list[dict]:
    """Load and cache the dairy commodities dataset."""
    global _commodities_cache
    if _commodities_cache is None:
        with open(_COMMODITIES_PATH, "r", encoding="utf-8") as fh:
            _commodities_cache = json.load(fh)
    return _commodities_cache


def _load_materials() -> list[dict]:
    """Load and cache the material specifications dataset."""
    global _materials_cache
    if _materials_cache is None:
        with open(_MATERIALS_PATH, "r", encoding="utf-8") as fh:
            _materials_cache = json.load(fh)
    return _materials_cache


# ---------------------------------------------------------------------------
# Core recommendation function
# ---------------------------------------------------------------------------
def get_packaging_recommendation(
    commodity_id: str,
    priority: str,
) -> dict:
    """Return the best-fit packaging material for a given dairy commodity.

    Parameters
    ----------
    commodity_id : str
        Unique identifier of the dairy commodity (e.g. ``"DC001"``).
    priority : str
        Optimisation axis. One of:

        * ``"maximize_shelf_life"`` – lowest OTR wins.
        * ``"minimize_cost"`` – lowest cost index wins.
        * ``"epr_compliance"`` – EPR-compliant only, then lowest cost.

    Returns
    -------
    dict
        A JSON-serialisable dictionary containing either:

        * ``status: "success"`` with the recommended material (including its
          ``failure_modes`` dictionary), metadata about the commodity, and a
          summary of the number of candidates that survived each filter stage.
        * ``status: "warning"`` / ``"error"`` with a human-readable message
          when no suitable material is found or input is invalid.
    """

    # ------------------------------------------------------------------
    # 0. Input validation
    # ------------------------------------------------------------------
    if priority not in _VALID_PRIORITIES:
        return {
            "status": "error",
            "message": (
                f"Invalid priority '{priority}'. "
                f"Must be one of: {', '.join(sorted(_VALID_PRIORITIES))}."
            ),
        }

    # ------------------------------------------------------------------
    # 1. Data Loading
    # ------------------------------------------------------------------
    try:
        commodities = _load_commodities()
        materials = _load_materials()
    except FileNotFoundError as exc:
        return {
            "status": "error",
            "message": f"Dataset file not found: {exc.filename}",
        }
    except json.JSONDecodeError as exc:
        return {
            "status": "error",
            "message": f"Malformed JSON in dataset: {exc.msg}",
        }

    # Find matching commodity
    commodity = None
    for item in commodities:
        if item["commodity_id"] == commodity_id:
            commodity = item
            break

    if commodity is None:
        return {
            "status": "error",
            "message": (
                f"Commodity '{commodity_id}' not found in the dataset. "
                f"Available IDs: {[c['commodity_id'] for c in commodities]}."
            ),
        }

    phase = commodity["phase_state"]
    fat_level = commodity["fat_content_level"]
    max_otr = commodity["max_allowable_otr"]
    max_wvtr = commodity["max_allowable_wvtr"]

    # Start with all materials
    candidates = list(materials)  # shallow copy
    total_materials = len(candidates)

    # ------------------------------------------------------------------
    # 2. Hard Filter 1 – Phase & Chemistry Guard
    # ------------------------------------------------------------------
    # 2a. Remove materials that don't support the commodity's phase state
    candidates = [
        m for m in candidates if phase in m["compatible_phase_states"]
    ]
    after_phase_filter = len(candidates)

    # 2b. If high-fat commodity, aggressively remove basic plastics that are
    #     prone to fat-leaching / plasticizer migration (mono-layer LDPE, etc.)
    if fat_level == "high":
        candidates = [
            m for m in candidates
            if m["category"] not in _BASIC_PLASTIC_CATEGORIES
        ]
    after_chemistry_filter = len(candidates)

    # ------------------------------------------------------------------
    # 3. Hard Filter 2 – Barrier Guard
    # ------------------------------------------------------------------
    candidates = [
        m for m in candidates
        if m["otr_value"] <= max_otr and m["wvtr_value"] <= max_wvtr
    ]
    after_barrier_filter = len(candidates)

    # If nothing survives the barrier guard, return a specific warning
    if not candidates:
        return {
            "status": "warning",
            "message": (
                f"No packaging materials meet the barrier constraints for "
                f"'{commodity['name']}' (max OTR: {max_otr} cc/m²/day, "
                f"max WVTR: {max_wvtr} g/m²/day). Consider relaxing the "
                f"barrier requirements or sourcing specialised materials."
            ),
            "commodity": commodity,
            "filter_summary": {
                "total_materials": total_materials,
                "after_phase_filter": after_phase_filter,
                "after_chemistry_filter": after_chemistry_filter,
                "after_barrier_filter": 0,
            },
        }

    # ------------------------------------------------------------------
    # 4. Soft Sort – Multi-Variable Optimisation
    # ------------------------------------------------------------------
    if priority == "maximize_shelf_life":
        # Lower OTR → better oxygen barrier → longer shelf life
        candidates.sort(key=lambda m: m["otr_value"])

    elif priority == "minimize_cost":
        # Lower cost index → cheaper packaging
        candidates.sort(key=lambda m: m["cost_index_per_kg"])

    elif priority == "epr_compliance":
        # First, retain only EPR-compliant materials
        candidates = [m for m in candidates if m["epr_compliant"] is True]
        if not candidates:
            return {
                "status": "warning",
                "message": (
                    f"No EPR-compliant materials meet the barrier constraints "
                    f"for '{commodity['name']}'. Consider hybrid packaging or "
                    f"consulting the EPR regulatory framework for exemptions."
                ),
                "commodity": commodity,
                "filter_summary": {
                    "total_materials": total_materials,
                    "after_phase_filter": after_phase_filter,
                    "after_chemistry_filter": after_chemistry_filter,
                    "after_barrier_filter": after_barrier_filter,
                    "after_epr_filter": 0,
                },
            }
        # Then sort by lowest cost among EPR-compliant options
        candidates.sort(key=lambda m: m["cost_index_per_kg"])

    # ------------------------------------------------------------------
    # 5. Return – Top recommendation
    # ------------------------------------------------------------------
    top = candidates[0]

    return {
        "status": "success",
        "commodity": commodity,
        "recommendation": {
            "material_id": top["material_id"],
            "name": top["name"],
            "category": top["category"],
            "otr_value": top["otr_value"],
            "wvtr_value": top["wvtr_value"],
            "cost_index_per_kg": top["cost_index_per_kg"],
            "epr_compliant": top["epr_compliant"],
            "compatible_phase_states": top["compatible_phase_states"],
            "failure_modes": top["failure_modes"],
        },
        "priority_used": priority,
        "filter_summary": {
            "total_materials": total_materials,
            "after_phase_filter": after_phase_filter,
            "after_chemistry_filter": after_chemistry_filter,
            "after_barrier_filter": after_barrier_filter,
            "final_candidates": len(candidates),
        },
        "runner_up": (
            {
                "material_id": candidates[1]["material_id"],
                "name": candidates[1]["name"],
                "otr_value": candidates[1]["otr_value"],
                "cost_index_per_kg": candidates[1]["cost_index_per_kg"],
            }
            if len(candidates) > 1
            else None
        ),
    }


# ---------------------------------------------------------------------------
# CLI convenience – run quick smoke tests
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import pprint

    test_cases = [
        ("DC001", "maximize_shelf_life"),   # Artisanal Paneer – high fat, solid
        ("DC002", "minimize_cost"),          # Pasteurized Liquid Milk
        ("DC004", "epr_compliance"),          # Cheddar Cheese – high fat, solid
        ("DC010", "maximize_shelf_life"),     # Cream Cheese Spread – paste, high fat
        ("DC007", "epr_compliance"),          # Mozzarella – very tight OTR (10)
        ("INVALID", "minimize_cost"),         # Error: bad commodity ID
        ("DC001", "bad_priority"),            # Error: bad priority
    ]

    for cid, prio in test_cases:
        print(f"\n{'=' * 70}")
        print(f"  commodity_id = {cid!r}  |  priority = {prio!r}")
        print(f"{'=' * 70}")
        result = get_packaging_recommendation(cid, prio)
        pprint.pprint(result, width=100)
